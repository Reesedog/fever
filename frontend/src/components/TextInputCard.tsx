import React, { useState, useEffect } from 'react';

const TextInputCard: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<string[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8000/ws/memo/');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('received message:', data.segment);
            setMessages(prevMessages => [...prevMessages, data.segment]);
        };
        setWs(socket);
        return () => {
            socket.close();
        };
    }, []);

    const sendMessage = () => {
        if (ws) {
            console.log('sending message:', inputText);
            ws.send(JSON.stringify({ message: inputText }));
            setInputText('');
        }
    };

    return (
        <div>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here"
            />
            <button onClick={sendMessage}>Send</button>
            <div>
                {messages.map((msg, index) => (
                    <div key={index} className="message-card">{msg}</div>
                ))}
            </div>
        </div>
    );
};

export default TextInputCard;
