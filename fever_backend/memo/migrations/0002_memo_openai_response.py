# Generated by Django 4.2.14 on 2024-07-20 05:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('memo', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='memo',
            name='openai_response',
            field=models.TextField(blank=True, null=True),
        ),
    ]
