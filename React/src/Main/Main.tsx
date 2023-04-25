import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

import './Main.css';


const socket: Socket = io('http://localhost:3001',{ withCredentials: true });

function Main() {


  interface Message {
    nickname: string;
    message: string;
  }

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomId, setRoom] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    // Join the specified room with the given nickname

    socket.on('connect', () => {
		console.log('Socket.IO connected!');
	  });

    // Listen for new messages in the room
    socket.on('newMessage', (data: Message) => {
      setMessages([...messages, data]);
    });

    // Listen for userJoined events
    socket.on('userJoined', (data: { nickname: string }) => {
      console.log(`${data.nickname} has joined the room`);
    });

	socket.on('errorMessage', (data: {message: string}) => {
		console.log(message);
	});
  }, [roomId, nickname, messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit('test', { roomId, nickname, message });
    setMessage('');
  };

  return (
    <div id="chat-box">
      <h1>Chat App</h1>
      <div>
        <input type="text" value={roomId} onChange={(e) => setRoom(e.target.value)} placeholder="Room ID" />
        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="nickname" />
        <button onClick={() => socket.emit('joinRoom', { roomId, nickname })}>Join Room</button>
		<button onClick={() => socket.emit('setUser', { nickname })}>user</button>
		<button onClick={() => socket.emit('createRoom', { roomId })}>create</button>
      </div>
      <div style={{ height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg: Message, index: number) => (
          <div key={index}>{msg.nickname}: {msg.message}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={() => socket.emit('sendMessage', { nickname ,message })}>Send</button>
      </form>
    </div>
  );
}

export default Main;