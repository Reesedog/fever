from django.db import models

class Memo(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    openai_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
