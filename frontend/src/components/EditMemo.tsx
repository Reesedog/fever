import React from 'react';
import { useParams } from 'react-router-dom';

interface Memo {
    id: number;
    title: string;
    content: string;
    openai_response: string;
    parameter: string;
    created_at: string;
}

interface EditMemoProps {
    memos: Memo[];
    setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
}

const EditMemo: React.FC<EditMemoProps> = ({ memos, setMemos }) => {
    const { id } = useParams<{ id: string }>();
    const memo = memos.find(memo => memo.id === parseInt(id || ""));

    if (!memo) {
        return <div>Memo not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-center">{memo.title}</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p><strong>Content:</strong> {memo.content}</p>
                <p><strong>OpenAI Response:</strong> {memo.openai_response}</p>
                <p><strong>Parameter:</strong> {memo.parameter}</p>
            </div>
        </div>
    );
};

export default EditMemo;
