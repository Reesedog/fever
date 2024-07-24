import React, { useState } from 'react';
import axios from 'axios';

interface Memo {
    id: number;
    title: string;
    content: string;
    openai_response: string;
    parameter: string;
    created_at: string;
}

interface MemoFormProps {
    memos: Memo[];
    setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
}

const MemoForm: React.FC<MemoFormProps> = ({ memos, setMemos }) => {
    const [title, setTitle] = useState('Test');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newMemo = { title, content };

        try {
            const response = await axios.post('http://localhost:8000/api/memos/', newMemo, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // console.log('Memo created:', response.data);
            setMemos([response.data, ...memos]); // 更新Memo列表
            setTitle('Test');
            setContent('');
        } catch (error) {
            console.error('There was an error creating the memo!', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title:</label>
                <input 
                    id="title"
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">Content:</label>
                <textarea 
                    id="content"
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Item</button>
        </form>
    );
};

export default MemoForm;
