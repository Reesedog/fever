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

# First, we create a EventHandler class to define
# how we want to handle the events in the response stream.
 
class EventHandler(AssistantEventHandler):    
  @override
  def on_text_created(self, text) -> None:
    print(f"\nassistant > ", end="", flush=True)
      
  @override
  def on_text_delta(self, delta, snapshot):
    print(delta.value, end="", flush=True)
    message = {
            'id': 0,
            'new_string': 'new_card'  # 用于触发前端创建新卡片
        }
        
    # 发送消息到 WebSocket 群组
    self.send_message_to_ws_group('memo_memo_room', message)
      
  def on_tool_call_created(self, tool_call):
    print(f"\nassistant > {tool_call.type}\n", flush=True)
  
  def on_tool_call_delta(self, delta, snapshot):
    if delta.type == 'code_interpreter':
      if delta.code_interpreter.input:
        print(delta.code_interpreter.input, end="", flush=True)
      if delta.code_interpreter.outputs:
        print(f"\n\noutput >", flush=True)
        for output in delta.code_interpreter.outputs:
          if output.type == "logs":
            print(f"\n{output.logs}", flush=True)

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
        
        title = serializer.validated_data.get('title')
        content = serializer.validated_data.get('content')
        
        # 保存 Memo 对象
        memo = Memo.objects.create(
            title=title,
            content=content,
            openai_response="openai_text",
            parameter=""
        )
        
        
    
        message = {
            'id': memo.id,
            'new_string': 'new_card'  # 用于触发前端创建新卡片
        }
        
        # 发送消息到 WebSocket 群组
        self.send_message_to_ws_group('memo_memo_room', message)
        print("Message sent to WebSocket group")
        
        client = OpenAI(api_key=openai_api_key)
 
        # 创建助手
        assistant = client.beta.assistants.create(
            instructions="You are an assistant that helps forming NDIS support plans. "
            "User will give you information about their disability. "
            "Then you should gather the related item and budget amount ($) and provide a formated support plan. "
            "The format should include support item and its budget amount. provide no more than 5 items."
            "Be clear about the item and its associated budget amount. "
            "Markdown format is strictly forbidden!!!!!"
            "////I repeat: Markdown format is strictly forbidden!!!!!////"
            "do not use markdown format such as **, ##, etc.",
            model="gpt-4o",
            tools=[{"type": "file_search"}],
        )
        
        assistant = client.beta.assistants.update(
            assistant_id=assistant.id,
            tool_resources={"file_search": {"vector_store_ids": ["vs_5iwLviwEL7Fjbtnzqwa8Ali2"]}},
        )
        
        # 创建会话
        thread = client.beta.threads.create()
        
        # 发送消息到会话
        message = client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=f"Content: {content}\n"
        )

        # 发送请求到 OpenAI API
        try:
            with client.beta.threads.runs.stream(
            thread_id=thread.id,
            assistant_id=assistant.id,
            event_handler=EventHandler(),
            ) as stream:
                stream.until_done()

            print("\n\nRun completed")
        #     if run.status == 'completed':
        #         messages = list(client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))
                
        #         # 获取最新的回复内容
        #         latest_message = None
        #         for msg in messages:
        #             if msg.role == "assistant":
        #                 latest_message = msg
        #                 break
                
        #         if latest_message:
        #             message_content = latest_message.content[0].text
        #             openai_text = message_content.value.strip()
        #         else:
        #             return Response({"error": "No assistant message found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        #     else:
        #         return Response({"error": f"Run status: {run.status}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
     
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
