from openai import OpenAI
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Memo
from .serializers import MemoSerializer
import os
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

# 从环境变量中获取 OpenAI API 密钥
openai_api_key = os.getenv('OPENAI_API_KEY')

class MemoViewSet(viewsets.ModelViewSet):
    queryset = Memo.objects.all()
    serializer_class = MemoSerializer

    def create(self, request, *args, **kwargs):
        # 获取前端传递的数据
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        title = serializer.validated_data.get('title')
        content = serializer.validated_data.get('content')
        
        client = OpenAI(api_key=openai_api_key)
 
        # 创建助手
        assistant = client.beta.assistants.create(
            name="Financial Analyst Assistant",
            instructions="You are an assistant",
            model="gpt-4o",
            tools=[{"type": "file_search"}],
        )
        
        # 创建向量存储
        # vector_store = client.beta.vector_stores.create(name="evidence")
 
        # file_paths = ["PB NDIS Pricing Arrangements and Price Limits 2023-24 v1.0.docx"]
        # file_streams = [open(path, "rb") for path in file_paths]
        
        # file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
        #     vector_store_id=vector_store.id, files=file_streams
        # )
        
        # You can print the status and the file counts of the batch to see the result of this operation.
        # print(file_batch.status)
        # print(file_batch.file_counts)
        # print(vector_store.id)
        
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
            content=f"Title: {title}\nContent: {content}\n"
        )

        # 发送请求到 OpenAI API
        try:
            run = client.beta.threads.runs.create_and_poll(
                thread_id=thread.id,
                assistant_id=assistant.id,
                instructions="You are an assistant"
            )

            if run.status == 'completed':
                messages = list(client.beta.threads.messages.list(thread_id=thread.id, run_id=run.id))
                
                # 打印所有消息以便调试
                for msg in messages:
                    print(msg)
                
                # 获取最新的回复内容
                latest_message = None
                for msg in messages:
                    if msg.role == "assistant":
                        latest_message = msg
                        break
                
                if latest_message:
                    message_content = latest_message.content[0].text
                    annotations = message_content.annotations
                    citations = []
                    for index, annotation in enumerate(annotations):
                        message_content.value = message_content.value.replace(annotation.text, f"[{index}]")
                        if file_citation := getattr(annotation, "file_citation", None):
                            cited_file = client.files.retrieve(file_citation.file_id)
                            citations.append(f"[{index}] {cited_file.filename}")

                    # print(message_content.value)
                    # print("\n".join(citations))
                    
                    openai_text = message_content.value.strip()
                else:
                    return Response({"error": "No assistant message found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({"error": f"Run status: {run.status}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 保存 Memo 对象
        memo = Memo.objects.create(
            title=title,
            content=content,
            openai_response=openai_text
        )
        
        assistant = client.beta.assistants.create(
            name="Financial Analyst Assistant",
            instructions="You are an assistant that uses the provided function to generate a organised support plan for NDIS participants.",
            model="gpt-3.5-turbo",
            tools=[{"type": "file_search"},
                   {
                    "type": "function",
                    "function": {
                        "name": "get_support_plan",
                        "description": "Get the first budget catagory and amount for ndis participant",
                        "parameters": {
                        "type": "object",
                        "properties": {
                            "catagory": {
                            "type": "string",
                            "description": "The support catagory"
                            },
                            "unit": {
                            "type": "integer",
                            "description": "The budget amount"
                            }
                        },
                        "required": ["catagory", "amount"]
                        }
                    }
                    },
                   ],
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
            content=openai_text
        )

        # 发送请求到 OpenAI API
        try:
            run = client.beta.threads.runs.create_and_poll(
                thread_id=thread.id,
                assistant_id=assistant.id,
            )
            
            print("\n\n\n")
            print(run)
                        
            if run.required_action:
                for tool in run.required_action.submit_tool_outputs.tool_calls:
                    if tool.function.name == "get_support_plan":
                        print(tool.function.arguments)
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
