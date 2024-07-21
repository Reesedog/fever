import axios from 'axios';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Memo {
    id: number;
    title: string;
    content: string;
    openai_response: string;
    parameter: string;
    created_at: string;
}

interface MemoComponentProps {
    memos: Memo[];
    setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
}

const MemoComponent: React.FC<MemoComponentProps> = ({ memos, setMemos }) => {
    useEffect(() => {
        axios.get('http://localhost:8000/api/memos/')
            .then(response => {
                // Sort memos by created_at in descending order
                const sortedMemos = response.data.sort((a: Memo, b: Memo) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setMemos(sortedMemos);
            })
            .catch(error => console.log(error));
    }, [setMemos]);

    const handleDelete = async (memoId: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/delete_memo/${memoId}/`);
            setMemos(memos.filter(memo => memo.id !== memoId));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Memos</h1>
            <ul>
                {memos.map(memo => (
                    <li key={memo.id} className="mb-4 p-4 border rounded shadow">
                        <h2 className="text-xl font-bold">{memo.title}</h2>
                        <h3 className="mb-2">{memo.content}</h3>
                        <ReactMarkdown className="text-sm text-gray-500">{memo.openai_response}</ReactMarkdown>
                        <p className="text-sm text-gray-500 mt-2">Parameter: {memo.parameter}</p>
                        <button
                            onClick={() => handleDelete(memo.id)}
                            className="text-red-500 hover:underline mt-2"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MemoComponent;
