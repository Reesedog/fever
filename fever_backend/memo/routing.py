from django.urls import path
from .consumers import MemoConsumer

websocket_urlpatterns = [
    path('ws/memo/', MemoConsumer.as_asgi()),
]
