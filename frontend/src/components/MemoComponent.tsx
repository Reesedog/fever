import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Memo {
    id: number;
    title: string;
    thread_id: string | null; // updated to include null
    created_at: string;
}

interface MemoComponentProps {
    memos: Memo[];
    setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
}

const MemoComponent: React.FC<MemoComponentProps> = ({ memos, setMemos }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/api/memos/')
            .then(response => {
                const sortedMemos = response.data.sort(
                    (a: Memo, b: Memo) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setMemos(sortedMemos);
            })
            .catch(error => console.log(error));
        return () => {};
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
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Items</h1>
            <ul className="space-y-4">
                {memos.map(memo => (
                    <li 
                        key={memo.id} 
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{memo.title}</h2>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleDelete(memo.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => navigate(`/edit/${memo.id}`)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            <strong>Thread ID:</strong> {memo.thread_id ? memo.thread_id : 'No Thread ID'}
                        </p>
                        <p className="text-gray-600">
                            <strong>Created At:</strong> {new Date(memo.created_at).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MemoComponent;
