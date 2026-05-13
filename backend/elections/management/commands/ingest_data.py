import logging

import pandas as pd
from django.core.management.base import BaseCommand, CommandError

from elections.models import Advertiser, Election, Topic, AdSpend
from elections.utils import parse_week_dates

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Ingest ad-spend CSV data into the normalised database schema"

    def add_arguments(self, parser):
        parser.add_argument("--file", type=str, default="dataset.csv")

    def handle(self, *args, **options):
        file_path = options["file"]
        self.stdout.write(f"Starting data ingestion from {file_path}\n")

        try:
            data = pd.read_csv(file_path)
        except Exception as exc:
            raise CommandError(f"Error reading data from {file_path}: {exc}") from exc

        data = self._clean_data(data)
        created_count = self._ingest_data(data)
        self.stdout.write(f"Ingestion complete. Created {created_count} AdSpend records.\n")

    def _clean_data(self, data):
        data = data.drop_duplicates()

        for column in ["advertiser", "election", "topic", "spend_week", "spend_month"]:
            data[column] = data[column].astype(str).str.strip()

        data["spend"] = pd.to_numeric(data["spend"], errors="coerce").fillna(0)

        return data

    def _ingest_data(self, data):
        advertisers = {}
        elections = {}
        topics = {}
        created_count = 0

        for _, row in data.iterrows():
            advertiser_name = row["advertiser"]
            if advertiser_name not in advertisers:
                advertiser, _ = Advertiser.objects.get_or_create(name=advertiser_name)
                advertisers[advertiser_name] = advertiser

            election_name = row["election"]
            if election_name not in elections:
                election, _ = Election.objects.get_or_create(name=election_name)
                elections[election_name] = election

            topic_name = row["topic"]
            if topic_name not in topics:
                topic, _ = Topic.objects.get_or_create(name=topic_name)
                topics[topic_name] = topic

            week_start, week_end = self._parse_week_dates(row.get("spend_week", ""))

            AdSpend.objects.create(
                advertiser=advertisers[advertiser_name],
                election=elections[election_name],
                topic=topics[topic_name],
                spend=row["spend"],
                week_start=week_start,
                week_end=week_end,
                raw_spend_week=row.get("spend_week", ""),
                raw_spend_month=row.get("spend_month", ""),
            )
            created_count += 1

        return created_count

    def _parse_week_dates(self, spend_week):
        return parse_week_dates(spend_week)
