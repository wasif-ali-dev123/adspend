from datetime import datetime

from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from elections.models import AdSpend


class SpendSummaryView(APIView):
    VALID_GROUP_BY = {"advertiser", "topic", "election", "week", "month"}

    def get(self, request):
        group_by = request.query_params.get("group_by")
        spend_month = request.query_params.get("spend_month")
        spend_week = request.query_params.get("spend_week")
        topic = request.query_params.get("topic")
        election = request.query_params.get("election")

        if not group_by:
            return Response(
                {"error": "group_by is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if group_by not in self.VALID_GROUP_BY:
            return Response(
                {"error": f"group_by must be one of: {', '.join(sorted(self.VALID_GROUP_BY))}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = AdSpend.objects.all()

        if spend_month:
            try:
                date = datetime.strptime(spend_month, "%Y-%m")
                queryset = queryset.filter(
                    week_start__year=date.year,
                    week_start__month=date.month,
                )
            except ValueError:
                return Response(
                    {"error": "invalid date format for spend_month, expected YYYY-MM"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if spend_week:
            try:
                date = datetime.strptime(spend_week, "%Y-%m-%d")
                queryset = queryset.filter(
                    week_start__lte=date.date(),
                    week_end__gte=date.date(),
                )
            except ValueError:
                return Response(
                    {"error": "invalid date format for spend_week, expected YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if topic:
            queryset = queryset.filter(topic__name=topic)

        if election:
            queryset = queryset.filter(election__name=election)

        if group_by == "advertiser":
            rows = (
                queryset
                .values("advertiser__name")
                .annotate(spend=Sum("spend"))
                .order_by("-spend")
            )
            result = [{"group": r["advertiser__name"], "spend": float(r["spend"])} for r in rows]

        elif group_by == "topic":
            rows = (
                queryset
                .values("topic__name")
                .annotate(spend=Sum("spend"))
                .order_by("-spend")
            )
            result = [{"group": r["topic__name"], "spend": float(r["spend"])} for r in rows]

        elif group_by == "election":
            rows = (
                queryset
                .values("election__name")
                .annotate(spend=Sum("spend"))
                .order_by("-spend")
            )
            result = [{"group": r["election__name"], "spend": float(r["spend"])} for r in rows]

        elif group_by == "week":
            rows = (
                queryset
                .values("raw_spend_week")
                .annotate(spend=Sum("spend"))
                .order_by("raw_spend_week")
            )
            result = [{"group": r["raw_spend_week"], "spend": float(r["spend"])} for r in rows]

        elif group_by == "month":
            rows = (
                queryset
                .values("raw_spend_month")
                .annotate(spend=Sum("spend"))
                .order_by("raw_spend_month")
            )
            result = [{"group": r["raw_spend_month"], "spend": float(r["spend"])} for r in rows]

        return Response(result, status=status.HTTP_200_OK)
