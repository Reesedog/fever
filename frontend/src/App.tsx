import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MemoComponent from './components/MemoComponent';
import MemoForm from './components/MemoForm';
import EditMemo from './components/EditMemo';

interface Memo {
    id: number;
    title: string;
    content: string;
    openai_response: string;
    parameter: string;
    created_at: string;
}

const App: React.FC = () => {
    const [memos, setMemos] = useState<Memo[]>([]);

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={
                        <>
                            <MemoForm memos={memos} setMemos={setMemos} />
                            <MemoComponent memos={memos} setMemos={setMemos} />
                        </>
                    } />
                    <Route path="/edit/:id" element={<EditMemo memos={memos} setMemos={setMemos} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
