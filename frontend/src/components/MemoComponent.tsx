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

    const renderParameterTable = (parameter: string) => {
        try {
            const parsedParameter = JSON.parse(parameter);
            if (!Array.isArray(parsedParameter.items)) return null;

            return (
                <table className="table-auto mt-4 w-full text-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 bg-gray-200">Item</th>
                            <th className="px-4 py-2 bg-gray-200">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsedParameter.items.map((item: { item: string; amount: number }, index: number) => (
                            <tr key={index} className="hover:bg-gray-100">
                                <td className="border px-4 py-2">{item.item}</td>
                                <td className="border px-4 py-2">{item.amount === 0 ? 'STQ' : item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } catch (error) {
            console.error('Failed to parse parameter:', error);
            return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Items</h1>
            <ul className="space-y-4">
                {memos.map(memo => (
                    <li key={memo.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{memo.title}</h2>
                            <button
                                onClick={() => handleDelete(memo.id)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                        <p className="text-gray-700 mb-4">{memo.content}</p>
                        <ReactMarkdown className="text-gray-600 mb-4">{memo.openai_response}</ReactMarkdown>
                        {renderParameterTable(memo.parameter)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MemoComponent;
