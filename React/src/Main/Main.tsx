import React, { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

import "./Main.css";
import ChannelWindow from "./ChannelWindow";
import PasswordModal from "./PasswordWindow";

const socket: Socket = io("http://localhost:3001", { withCredentials: true });

function Main() {
  interface Message {
    nickname: string;
    message: string;
  }

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("yaho");
  const [selectedTab, setSelectedTab] = useState("channel");
  const [friends, setFriends] = useState<string[]>([]);
  const [channelUser, setChannelUser] = useState<string[]>([]);
  const [showChannel, setChannel] = useState(false);
  const [selectUser, setSelectUser] = useState<string>("");
  const [privateRoomName, setPrivateRoomName] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement>(null); // create a ref for the chat window

  useEffect(() => {
    setFriends(["yachoi", "ean", "sunghkim"]);
    // setChannelUser(['sokim', 'sojoo', 'captain']);
  }, []); // test

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.IO connected!");
      const randomNumber = Math.floor(Math.random() * 900) + 100;
      setNickname(`Yachoi ${randomNumber}`);
      socket.emit("setUser", { nickname: `Yachoi ${randomNumber}` });
    });

    socket.on("joinRoom", (data: { roomName: string }) => {
      setRoomName(data.roomName);
      setMessages([]);
    });

    socket.on("userList", (userList: string[]) => {
      setChannelUser(userList);
    });

    socket.on("newMessage", (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("addUser", (nickname: string) => {
      const newMessage: Message = {
        nickname: nickname,
        message: " has joined the room",
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("errorMessage", (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("passwordRequired", (body: { roomName: string }) => {
      setPrivateRoomName(body.roomName);
      setShowPasswordModal(true);
    });
    // socket.on("channelList", (data: any) => {
    //   console.log(data);
    // });
  }, []);

  const handleFriendListClick = () => setSelectedTab("friends");
  const handleChannelListClick = () => setSelectedTab("channel");

  const [isComposing, setIsComposing] = useState<boolean>(false);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isComposing) {
      socket.emit("sendMessage", { message: message });
      setMessage("");
    }
  };

  const handleJoinChannelClick = () => {
    socket.emit("chatRoomList");
    setChannel(true);
  };

  const handleCloseChannel = () => {
    // socket.emit( )
    setChannel(false);
  };

  const handleUserClick = (user: string) => {
    if (user === selectUser) {
      setSelectUser("");
    } else setSelectUser(user);
  };

  const userProfile = (user: string) => {
    const newMessage: Message = {
      nickname: "<system>",
      message: ` go to ${user} profile.`,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const addFriend = (user: string) => {
    const newMessage: Message = {
      nickname: "<system>",
      message: ` Add ${user} as friend.`,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const deleteFriend = (user: string) => {
    const newMessage: Message = {
      nickname: "<system>",
      message: ` ${user} is deleted from friend list.`,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const banUser = (user: string) => {
    const newMessage: Message = {
      nickname: "<system>",
      message: ` You have banned ${user}.`,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const inviteGame = (user: string) => {
    const newMessage: Message = {
      nickname: "<system>",
      message: ` You invited ${user} to a dual.`,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    // Handle password required event
  }, []);

  const handlePasswordSubmit = ( submit: any ) => {
    // Send the password to the server
    socket.emit("sendPassword", submit);
    console.log(submit);
    setShowPasswordModal(false);
  };

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
          <div id="chat-name">{roomName}</div>
          <div id="chat-window" ref={chatWindowRef}>
            {messages.map((msg: Message, index: number) => (
              <div
                key={index}
                className={
                  msg.nickname === "<system>"
                    ? "system-message"
                    : msg.nickname === nickname
                    ? "my-message"
                    : ""
                }
              >
                {msg.nickname}: {msg.message}
              </div>
            ))}
          </div>
          <input
            id="send-message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => handleChatKeyDown(e)}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
        </div>
        <div id="switch-box">
          <div id="switch-buttons">
            <button
              id="friendlist-button"
              className={selectedTab === "friends" ? "selected" : ""}
              onClick={handleFriendListClick}
            >
              Friends
            </button>
            <button
              id="channellist-button"
              className={selectedTab === "channel" ? "selected" : ""}
              onClick={handleChannelListClick}
            >
              Channel
            </button>
          </div>
          <div id="list-window">
            {selectedTab === "friends" && (
              <div>
                {friends.map((user) => (
                  <div
                    key={user}
                    onClick={() => handleUserClick(user)}
                    className={selectUser === user ? "user-selected" : ""}
                  >
                    {user}
                    {selectUser === user && (
                      <div className="button-container">
                        <button onClick={() => userProfile(user)}>
                          Profile
                        </button>
                        <button onClick={() => deleteFriend(user)}>
                          delete user
                        </button>
                        <button onClick={() => inviteGame(user)}>1vs1</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {selectedTab === "channel" && (
              <div>
                {channelUser.map((user) => (
                  <div
                    key={user}
                    onClick={() => handleUserClick(user)}
                    className={selectUser === user ? "user-selected" : ""}
                  >
                    {user}
                    {selectUser === user && (
                      <div className="button-container">
                        <button onClick={() => userProfile(user)}>
                          Profile
                        </button>
                        <button onClick={() => addFriend(user)}>
                          Add Friend
                        </button>
                        <button onClick={() => banUser(user)}>Ban</button>
                        <button onClick={() => inviteGame(user)}>1vs1</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {!showChannel && (
              <button id="join-channel" onClick={handleJoinChannelClick}>
                Join Channel
              </button>
            )}
            {showChannel && (
              <ChannelWindow
                socket={socket}
                onClose={handleCloseChannel}
                setChannel={setChannel}
              />
            )}
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <PasswordModal
            onSubmit={handlePasswordSubmit}
            privateRoomName={privateRoomName}
          />
        </div>
      )}
    </div>
  );
}

export default Main;
