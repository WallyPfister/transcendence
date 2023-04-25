import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

import './Main.css';



function Main() {

  const socket: Socket = io('http://localhost:3000');

  interface Message {
    username: string;
    message: string;
  }

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Join the specified room with the given username
    socket.emit('joinRoom', { roomId: room, username });
    
    // Listen for new messages in the room
    socket.on('newMessage', (data: Message) => {
      setMessages([...messages, data]);
    });

    // Listen for userJoined events
    socket.on('userJoined', (data: { username: string }) => {
      console.log(`${data.username} has joined the room`);
    });
  }, [room, username, messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit('test', { roomId: room, username, message });
    setMessage('');
  };

  return (
    <div id="chat-box">
      <h1>Chat App</h1>
      <div>
        <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room ID" />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <button onClick={() => socket.emit('joinRoom', { roomId: room, username })}>Join Room</button>
      </div>
      <div style={{ height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg: Message, index: number) => (
          <div key={index}>{msg.username}: {msg.message}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Main;