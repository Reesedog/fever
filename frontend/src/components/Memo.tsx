import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Memo {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

const MemoComponent: React.FC = () => {
    const [memos, setMemos] = useState<Memo[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/memos/')
            .then(response => setMemos(response.data))
            .catch(error => console.log(error));
    }, []);

    return (
        <div>
            <h1>Memos</h1>
            <ul>
                {memos.map(memo => (
                    <li key={memo.id}>
                        <h2>{memo.title}</h2>
                        <p>{memo.content}</p>
                        <p>{memo.created_at}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MemoComponent;
