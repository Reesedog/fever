// src/components/ClaimForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import ResultDisplay from './ResultDisplay';

const ClaimForm: React.FC = () => {
    const [claim, setClaim] = useState('');
    const [result, setResult] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/verify_claim/', { claim });
            setResult(response.data.result);
        } catch (error) {
            console.error("Error verifying claim", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter your claim:
                    <input
                        type="text"
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
            {result && <ResultDisplay result={result} />}
        </div>
    );
};

export default ClaimForm;
