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
  const [selectedTab, setSelectedTab] = useState('channel');
  const [friends, setFriends] = useState<string[]>([]);
  const [channelUser, setChannelUser] = useState<string[]>([]);
  const [channelList, setChannelList] = useState<string[]>([]);

  useEffect(() => {
    setFriends(["yachoi", "ean", "sunghkim"]);
    setChannelUser(["sokim", "sojoo", "captain"]);
  }); // test

  useEffect(() => {
    // Join the specified room with the given nickname

    socket.on('connect', () => {
		  console.log('Socket.IO connected!');
      socket.emit('setUser', { nickname })
	  });

    socket.on('userList', (userList: string[]) => {
      setChannelList(userList);
    });

    // Listen for new messages in the room
    socket.on('newMessage', (data: Message) => {
      setMessages([...messages, data]);
    });

    // Listen for userJoined events
    socket.on('addUser', (nickname: string) => {
      console.log(`${nickname} has joined the room`);
      const newMessage: Message = {
        nickname: nickname,
        message: `${nickname} has joined the room`,
      };
      setMessages([...messages, newMessage]);
    });


    socket.on('errorMessage', (data: string) => {
      console.log(data);
    });



  }, [roomId, nickname, messages, message]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit('test', { roomId, nickname, message });
    setMessage('');
  };

  const handleFriendListClick = () => setSelectedTab('friends');
  const handleChannelListClick = () => setSelectedTab('channel');


  return (
    <div id="main">
      <div id="top-buttons">
        <div id="game-buttons">
          <button id="casual-button">1 vs 1</button>
          <button id="ladder-button">Rank</button>
          <button id="ranking-button">Ranking</button>
        </div>
        <button id="profile-button">My Profile</button>
      </div>
      <div id="chat-interface">
        <div id="chat-box">
          <div id="chat-window">
            {messages.map((msg: Message, index: number) => (
              <div key={index}>{msg.nickname}: {msg.message}</div>
            ))}
          </div>
          <input 
            id="send-message"
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') {
              socket.emit('sendMessage', { nickname ,message })
            }}}
          />
        </div>
        <div id="switch-box">
          <div id="switch-buttons">
            <button id="friendlist-button" onClick={handleFriendListClick}>Friends</button>
            <button id="channellist-button" onClick={handleChannelListClick}>Channel</button>
          </div>
          <div id="list-window">
            {selectedTab === 'friends' && (
              <div>
                {friends.map((friend) => (
                  <div key={friend}>{friend}</div>
                ))}
              </div>
            )}
            {selectedTab === 'channel' && (
              <div>
                {channelUser.map((channel) => (
                  <div key={channel}>{channel}</div>
                ))}
              </div>
            )}
          </div>
          <div id="shitch-button">
            <button id="join-channel">Join Channel</button>
            {/* <button id="add-friend">Add Friend</button> */}
          </div>
          {/* <input type="text" value={roomId} onChange={(e) => setRoom(e.target.value)} placeholder="Room ID" />
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="nickname" />
          <button onClick={() => socket.emit('joinRoom', { roomId, nickname })}>Join Room</button>
          <button onClick={() => socket.emit('setUser', { nickname })}>user</button>
          <button onClick={() => socket.emit('createRoom', { roomId })}>create</button> */}
        </div>
      </div>
    </div>
  );
}

export default Main;