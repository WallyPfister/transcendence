import React, { useState, useEffect, useRef, useContext } from "react";

import "./Main.css";
import ChannelWindow from "./ChannelWindow";
import PasswordModal from "./PasswordWindow";
import { SocketContext } from "../Socket/SocketContext";
import { useNavigate } from "react-router-dom";
import { InviteGameModal, useInviteGame } from "../Socket/InviteGameModal";
import { StartGameModal, useStartGame } from "../Socket/StartGameModal";
import CustomAxios from "../Etc/CustomAxios";

function Main() {
  const socket = useContext(SocketContext);
  const { showInvite, closeInvite, inviteData } = useInviteGame(socket);
  const { showStart, closeStart, startData } = useStartGame(socket);
  const navigate = useNavigate();

  interface Message {
    nickname: string;
    message: string;
  }

  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("channel");
  const [friends, setFriends] = useState<string[]>([]);
  const [channelUser, setChannelUser] = useState<string[]>([]);
  const [showChannel, setChannel] = useState<boolean>(false);
  const [selectUser, setSelectUser] = useState<string>("");
  const [privateRoomName, setPrivateRoomName] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inviteGameSelect, setInviteGameSelect] = useState<boolean>(false);

  const chatWindowRef = useRef<HTMLDivElement>(null); // create a ref for the chat window

  useEffect(() => {
    async function fetchData() {
      const res = await CustomAxios.get("/member");
      setNickname(res.data);
    }
    fetchData();
    console.log(nickname);
    socket.emit("setUser", { nickname: nickname });
  }, []); // test

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.IO connected!");
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

  const handleCasualGame = (user: string) => {
    socket.emit("enterGame", 0);
  };

  const handleLadderGame = (user: string) => {
    socket.emit("enterGame", 2);
  };

  const [isComposing, setIsComposing] = useState<boolean>(false);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const goToRanking = (user: string) => {
    // You can pass user as a parameter if you need it in the profile page
    navigate("/rank", { state: { user } });
  };

  const goToProfile = (user: string) => {
    // You can pass user as a parameter if you need it in the profile page
    navigate("/profile", { state: { user } });
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
    } else {
      setInviteGameSelect(false); // 나중에 지울지도
      setSelectUser(user);
    }
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

  const inviteGame = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event from bubbling up
    setInviteGameSelect(true);
  };

  const selectGametype = (user: string, type: string) => {
    // normal = 0, power = 1
    console.log("invite");
    if (type === "normal") {
      socket.emit("invite", { type: 0, invitee: user });
    } else if (type === "power") {
      socket.emit("invite", { type: 1, invitee: user });
    }
    const newMessage: Message = {
      nickname: "<system>",
      message: ` You challanged ${user} to a ${type} dual.`,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInviteGameSelect(false);
  };

  useEffect(() => {
    // Handle password required event
  }, []);

  const handlePasswordSubmit = (submit: any) => {
    // Send the password to the server
    socket.emit("sendPassword", submit);
    console.log(submit);
    setShowPasswordModal(false);
  };

  return (
    <div id="main">
      <div id="top-buttons">
        <div id="game-buttons">
          <button id="casual-button" onClick={() => handleCasualGame(nickname)}>
            1 vs 1
          </button>
          <button id="ladder-button" onClick={() => handleLadderGame(nickname)}>
            Rank
          </button>
          <button id="ranking-button" onClick={() => goToRanking(nickname)}>
            Ranking
          </button>
        </div>
        <button id="profile-button" onClick={() => goToProfile(nickname)}>
          My Profile
        </button>
      </div>
      <div id="chat-interface">
        <div id="chat-box">
          <div id="chat-name">{roomName}</div>
          <div id="chat-window" ref={chatWindowRef}>
            {messages.map(
              (msg: Message, index: number) =>
                msg.message !== "" && (
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
                )
            )}
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
                        <button onClick={(event) => inviteGame(event)}>
                          1vs1
                        </button>
                        <div className="button-invite-type">
                          <button
                            className="button-normal-invite"
                            onClick={() => selectGametype(user, "normal")}
                          >
                            Normal
                          </button>
                          <button
                            className="button-power-invite"
                            onClick={() => selectGametype(user, "Power")}
                          >
                            Power
                          </button>
                        </div>
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
                    {selectUser === user && selectUser !== nickname && (
                      <div className="button-container">
                        <button onClick={() => userProfile(user)}>
                          Profile
                        </button>
                        <button onClick={() => addFriend(user)}>
                          Add Friend
                        </button>
                        <button onClick={() => banUser(user)}>Ban</button>
                        <button onClick={(event) => inviteGame(event)}>
                          1vs1
                        </button>
                        {inviteGameSelect === true && (
                          <div className="button-invite-type">
                            <button
                              className="button-normal-invite"
                              onClick={() => selectGametype(user, "normal")}
                            >
                              Normal
                            </button>
                            <button
                              className="button-power-invite"
                              onClick={() => selectGametype(user, "Power")}
                            >
                              Power
                            </button>
                          </div>
                        )}
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
      {showInvite && (
        <div className="invite-modal-overlay">
          <InviteGameModal
            onClose={closeInvite}
            socket={socket}
            inviteData={inviteData}
          />
        </div>
      )}
      {showStart && (
        <div className="startgame-modal-overlay">
          <StartGameModal onClose={closeStart} data={startData} />
        </div>
      )}
    </div>
  );
}

export default Main;
