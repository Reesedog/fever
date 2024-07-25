import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Message {
    sender: string;
    content: string;
}

interface Memo {
    id: number;
    title: string;
    thread_id: string | null; // updated to include null
    created_at: string;
}

const EditMemo: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [memo, setMemo] = useState<Memo | null>(null);

    useEffect(() => {
        const fetchMemo = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/memos/${id}`);
                const data = await response.json();
                setMemo(data);
            } catch (error) {
                console.error('Error fetching memo:', error);
            }
        };

        fetchMemo();
    }, [id]);

    if (!memo) {
        return <div>Memo not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-center">{memo.title}</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div>
                    
                </div>
            </div>
        </div>
    );
};

export default EditMemo;
