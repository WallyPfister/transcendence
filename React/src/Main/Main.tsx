import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import './Main.css';


function Main() {

    const socket = io('http://localhost:3001');

    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [room, setRoom] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Join the specified room with the given username
        socket.emit('joinRoom', { roomId: room, username });
        
        // Listen for new messages in the room
        socket.on('newMessage', (data) => {
          setMessages([...messages, data]);
        });
    
        // Listen for userJoined events
        socket.on('userJoined', (data) => {
          console.log(`${data.username} has joined the room`);
        });
      }, [room, username]);
    
      const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        socket.emit('test', { roomId: room, username, message });
        setMessage('');
      };
  
    return (
        <div className="chat">
        <h1>Chat test</h1>
          <div>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room ID" />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <button onClick={() => socket.emit('joinRoom', { roomId: room, username: username })}>Join Room</button>
          </div>
          <form onSubmit={handleSubmit}>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit">Send</button>
          </form>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
        </div>
        
      );
}

export default Main;