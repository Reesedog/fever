from django.db import models

class Memo(models.Model):
    title = models.CharField(max_length=100)
    conversation = models.JSONField(null=True, blank=True)
    thread_id = models.CharField(max_length=100, null=True, blank=True)
    parameter = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
