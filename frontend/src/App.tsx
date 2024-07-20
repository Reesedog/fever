import React from 'react';
import MemoComponent from './components/Memo';
import MemoForm from './components/MemoForm';

const App: React.FC = () => {
    return (
        <div className="App">
            <MemoForm />
            <MemoComponent />
        </div>
    );
}

export default App;
