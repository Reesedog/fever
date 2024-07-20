from rest_framework import viewsets
from .models import Memo
from .serializers import MemoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class MemoViewSet(viewsets.ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer

    @action(detail=False, methods=['post'])
    def create_memo(self, request):
        serializer = MemoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
