from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemoViewSet
from . import views

router = DefaultRouter()
router.register(r'memos', MemoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('delete_memo/<int:memo_id>/', views.delete_memo, name='delete_memo'),
]
