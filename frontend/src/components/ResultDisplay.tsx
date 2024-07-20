// src/components/ResultDisplay.tsx
import React from 'react';

interface ResultDisplayProps {
    result: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
    return (
        <div>
            <h3>Result:</h3>
            <p>{result}</p>
        </div>
    );
};

export default ResultDisplay;
