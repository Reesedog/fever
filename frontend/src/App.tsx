import React, { useState } from 'react';
import MemoComponent from './components/MemoComponent';
import MemoForm from './components/MemoForm';

interface Memo {
    id: number;
    title: string;
    content: string;
    openai_response: string;
    created_at: string;
}

const App: React.FC = () => {
    const [memos, setMemos] = useState<Memo[]>([]);

    return (
        <div className="App">
            <MemoForm memos={memos} setMemos={setMemos} />
            <MemoComponent memos={memos} setMemos={setMemos} />
        </div>
    );
};

export default App;
