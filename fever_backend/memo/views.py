from openai import OpenAI
from typing_extensions import override
from openai import AssistantEventHandler
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Memo
from .serializers import MemoSerializer
import os
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import re

# First, we create a EventHandler class to define
# how we want to handle the events in the response stream.

class EventHandler(AssistantEventHandler):   
    def __init__(self):
        super().__init__()
        self.messages = []
        self.citation_count = 0

    @staticmethod
    def send_message_to_ws_group(group_name, message):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'memo_message',
                'message': message
            }
        )   

    @override
    def on_text_created(self, text) -> None:
        print(f"\nassistant > ", end="", flush=True)
      
    @override
    def on_text_delta(self, delta, snapshot):
        message = {'id': 0}
        message['new_string'] = delta.value
        
        # 发送消息到 WebSocket 群组
        self.send_message_to_ws_group('memo_memo_room', message)
        self.messages.append(message['new_string'])
      
   

    def get_full_message(self):
        return ''.join(self.messages)


# 从环境变量中获取 OpenAI API 密钥
openai_api_key = os.getenv('OPENAI_API_KEY')

class MemoViewSet(viewsets.ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer
    
    @staticmethod
    def send_message_to_ws_group(group_name, message):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'memo_message',
                'message': message
            }
        )

    def create(self, request, *args, **kwargs):
        # 获取前端传递的数据
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(serializer.validated_data)
        title = serializer.validated_data.get('title')
        content = serializer.validated_data.get('content')
        
        client = OpenAI(api_key=openai_api_key)
        
        assistant = client.beta.assistants.update(
            assistant_id="asst_MjvblD3VdIUf44BZjAqF38K4",
        )
        
        # thread = client.beta.threads.create()
        
        thread_id = "thread_kTiypNff70IUhYIQAlHVU09A"
        
        print(thread_id)
        
        message = client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=title
        )
        
        print(title)
        
        # 保存 Memo 对象
        memo = Memo.objects.create(
            title=title,
            conversation={
                "messages": []
            },
            thread_id=thread_id,
        )
        
        event_handler = EventHandler()
        
        try:
            with client.beta.threads.runs.stream(
            thread_id=thread_id,
            assistant_id=assistant.id,
            event_handler=event_handler,
            ) as stream:
                stream.until_done()

            print("\n\nRun completed")

        except Exception as e:
            print(f"Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        memo.save()
        
        data = client.beta.threads.messages.list(thread_id).data
        for message in data:
            for content_block in message.content:
                if content_block.type == 'text':
                    print(content_block.text.value)
                    print("\nnew message\n")
     
        # 序列化并返回响应
        result_serializer = MemoSerializer(memo)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    

@csrf_exempt
def delete_memo(request, memo_id):
    if request.method == 'DELETE':
        memo = get_object_or_404(Memo, id=memo_id)
        memo.delete()
        return JsonResponse({'message': 'Memo deleted successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)