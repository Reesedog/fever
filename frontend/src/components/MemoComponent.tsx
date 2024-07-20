import axios from 'axios';
import React, { useEffect } from 'react';

interface Memo {
    id: number;
    title: string;
    content: string;
    openai_response: string;
    created_at: string;
}

interface MemoComponentProps {
    memos: Memo[];
    setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
}

const MemoComponent: React.FC<MemoComponentProps> = ({ memos, setMemos }) => {
    useEffect(() => {
        axios.get('http://localhost:8000/api/memos/')
            .then(response => setMemos(response.data))
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

    const createMarkup = (text: string) => {
        const formattedText = text.replace(/\n/g, '<br />');
        return { __html: formattedText };
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Memos</h1>
            <ul>
                {memos.map(memo => (
                    <li key={memo.id} className="mb-4 p-4 border rounded shadow">
                        <h2 className="text-xl font-bold">{memo.title}</h2>
                        <div dangerouslySetInnerHTML={createMarkup(memo.content)} />
                        <p className="text-sm text-gray-500">{memo.created_at}</p>
                        <div className="text-sm text-gray-500" dangerouslySetInnerHTML={createMarkup(memo.openai_response)} />
                        <button
                            onClick={() => handleDelete(memo.id)}
                            className="text-red-500 hover:underline"
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
