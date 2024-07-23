from django.urls import re_path
from .consumers import MemoConsumer

websocket_urlpatterns = [
    re_path(r'ws/memo/$', MemoConsumer.as_asgi()),
]
