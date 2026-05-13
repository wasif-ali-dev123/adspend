from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient

from elections.models import Advertiser, Election, Topic, AdSpend
from elections.utils import parse_week_dates


def _make_advertiser(name="Test Advertiser"):
    return Advertiser.objects.create(name=name)


def _make_election(name="Test Election"):
    return Election.objects.create(name=name)


def _make_topic(name="Test Topic"):
    return Topic.objects.create(name=name)


def _make_adspend(advertiser, election, topic, spend="100.00",
                  week_start="2024-10-01", week_end="2024-10-06",
                  raw_spend_week="2024_10/01-10/06",
                  raw_spend_month="2024_10"):
    return AdSpend.objects.create(
        advertiser=advertiser,
        election=election,
        topic=topic,
        spend=Decimal(spend),
        week_start=week_start,
        week_end=week_end,
        raw_spend_week=raw_spend_week,
        raw_spend_month=raw_spend_month,
    )


class ParseWeekDatesTest(TestCase):
    def test_valid_week_string(self):
        start, end = parse_week_dates("2024_10/01-10/06")
        self.assertEqual(start, "2024-10-01")
        self.assertEqual(end, "2024-10-06")

    def test_invalid_returns_none_tuple(self):
        start, end = parse_week_dates("not-a-week")
        self.assertIsNone(start)
        self.assertIsNone(end)

    def test_empty_string_returns_none_tuple(self):
        start, end = parse_week_dates("")
        self.assertIsNone(start)
        self.assertIsNone(end)


class AdvertiserModelTest(TestCase):
    def test_create_advertiser(self):
        adv = _make_advertiser("ACME Corp")
        self.assertEqual(adv.name, "ACME Corp")
        self.assertIsNotNone(adv.created_at)
        self.assertIsNotNone(adv.updated_at)

    def test_advertiser_str(self):
        adv = _make_advertiser("ACME Corp")
        self.assertEqual(str(adv), "ACME Corp")


class ElectionModelTest(TestCase):
    def test_create_election(self):
        elec = _make_election("NV-SEN")
        self.assertEqual(elec.name, "NV-SEN")

    def test_election_str(self):
        elec = _make_election("NV-SEN")
        self.assertEqual(str(elec), "NV-SEN")


class TopicModelTest(TestCase):
    def test_create_topic(self):
        topic = _make_topic("Climate & Energy")
        self.assertEqual(topic.name, "Climate & Energy")

    def test_topic_str(self):
        topic = _make_topic("Climate & Energy")
        self.assertEqual(str(topic), "Climate & Energy")


class AdSpendModelTest(TestCase):
    def setUp(self):
        self.adv = _make_advertiser()
        self.elec = _make_election()
        self.topic = _make_topic()

    def test_create_adspend(self):
        record = _make_adspend(self.adv, self.elec, self.topic, spend="250.50")
        self.assertEqual(record.spend, Decimal("250.50"))
        self.assertEqual(record.advertiser, self.adv)
        self.assertEqual(record.election, self.elec)
        self.assertEqual(record.topic, self.topic)
        self.assertEqual(record.raw_spend_week, "2024_10/01-10/06")
        self.assertEqual(record.raw_spend_month, "2024_10")

    def test_cascade_delete_advertiser(self):
        _make_adspend(self.adv, self.elec, self.topic)
        self.adv.delete()
        self.assertEqual(AdSpend.objects.count(), 0)


class SpendSummaryViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.adv1 = _make_advertiser("Advertiser A")
        self.adv2 = _make_advertiser("Advertiser B")
        self.elec1 = _make_election("NV-SEN")
        self.elec2 = _make_election("AZ-GOV")
        self.topic1 = _make_topic("Climate & Energy")
        self.topic2 = _make_topic("Abortion")

        _make_adspend(self.adv1, self.elec1, self.topic1, "1000.00",
                      week_start="2024-10-01", week_end="2024-10-06",
                      raw_spend_week="2024_10/01-10/06", raw_spend_month="2024_10")
        _make_adspend(self.adv1, self.elec2, self.topic2, "500.00",
                      week_start="2024-10-01", week_end="2024-10-06",
                      raw_spend_week="2024_10/01-10/06", raw_spend_month="2024_10")
        _make_adspend(self.adv2, self.elec1, self.topic1, "750.00",
                      week_start="2024-11-01", week_end="2024-11-06",
                      raw_spend_week="2024_11/01-11/06", raw_spend_month="2024_11")

    def _url(self, **params):
        from urllib.parse import urlencode
        base = "/spend/summary"
        if params:
            base += "?" + urlencode(params)
        return base

    def test_missing_group_by_returns_400(self):
        response = self.client.get("/spend/summary")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_invalid_group_by_returns_400(self):
        response = self.client.get(self._url(group_by="invalid"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_group_by_advertiser(self):
        response = self.client.get(self._url(group_by="advertiser"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["Advertiser A"]), 1500.00)
        self.assertAlmostEqual(float(groups["Advertiser B"]), 750.00)

    def test_group_by_advertiser_ordered_by_spend_desc(self):
        response = self.client.get(self._url(group_by="advertiser"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        spends = [float(item["spend"]) for item in data]
        self.assertEqual(spends, sorted(spends, reverse=True))

    def test_group_by_topic(self):
        response = self.client.get(self._url(group_by="topic"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["Climate & Energy"]), 1750.00)
        self.assertAlmostEqual(float(groups["Abortion"]), 500.00)

    def test_group_by_election(self):
        response = self.client.get(self._url(group_by="election"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["NV-SEN"]), 1750.00)
        self.assertAlmostEqual(float(groups["AZ-GOV"]), 500.00)

    def test_filter_by_election(self):
        response = self.client.get(self._url(group_by="advertiser", election="NV-SEN"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["Advertiser A"]), 1000.00)
        self.assertAlmostEqual(float(groups["Advertiser B"]), 750.00)
        self.assertNotIn("AZ-GOV", groups)

    def test_filter_by_topic(self):
        response = self.client.get(self._url(group_by="advertiser", topic="Abortion"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["Advertiser A"]), 500.00)
        self.assertNotIn("Advertiser B", groups)

    def test_filter_by_spend_month(self):
        response = self.client.get(self._url(group_by="advertiser", spend_month="2024-10"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["Advertiser A"]), 1500.00)
        self.assertNotIn("Advertiser B", groups)

    def test_invalid_spend_month_returns_400(self):
        response = self.client.get(self._url(group_by="advertiser", spend_month="not-a-date"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_group_by_month(self):
        response = self.client.get(self._url(group_by="month"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["2024_10"]), 1500.00)
        self.assertAlmostEqual(float(groups["2024_11"]), 750.00)

    def test_group_by_week(self):
        response = self.client.get(self._url(group_by="week"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = {item["group"]: item["spend"] for item in data}
        self.assertAlmostEqual(float(groups["2024_10/01-10/06"]), 1500.00)
        self.assertAlmostEqual(float(groups["2024_11/01-11/06"]), 750.00)
