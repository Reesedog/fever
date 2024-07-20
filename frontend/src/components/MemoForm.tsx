import React, { useState } from 'react';
import axios from 'axios';

const MemoForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newMemo = { title, content };

        try {
            const response = await axios.post('http://localhost:8000/api/memos/', newMemo);
            console.log('Memo created:', response.data);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('There was an error creating the memo!', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                />
            </div>
            <div>
                <label>Content:</label>
                <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                />
            </div>
            <button type="submit">Add Memo</button>
        </form>
    );
};

export default MemoForm;
