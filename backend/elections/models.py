from django.db import models


class TimestampModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Advertiser(TimestampModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Topic(TimestampModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Election(TimestampModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class AdSpend(TimestampModel):
    advertiser = models.ForeignKey(Advertiser, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    week_start = models.DateField()
    week_end = models.DateField()
    spend = models.DecimalField(max_digits=14, decimal_places=4)
    raw_spend_week = models.CharField(max_length=50, blank=True, default="")
    raw_spend_month = models.CharField(max_length=20, blank=True, default="")
