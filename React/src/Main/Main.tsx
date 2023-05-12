import React, { useState, useEffect, useRef, useContext } from "react";

import "./Main.css";
import ChannelWindow from "./Components/ChannelWindow/ChannelWindow";
import PasswordModal from "./Components/PasswordModal/PasswordModal";
import Gamebuttons from "./Components/Gamebuttons/Gamebuttons"
import { SocketContext } from "../Socket/SocketContext";
import { useNavigate } from "react-router-dom";
import { InviteGameModal, useInviteGame } from "../Socket/InviteGameModal";
import { StartGameModal, useStartGame } from "../Socket/StartGameModal";
import CustomAxios from "../Util/CustomAxios";
import { removeToken } from "../Util/errorHandler";

function Main() {
  const socket = useContext(SocketContext);
  const { showInvite, closeInvite, inviteData } = useInviteGame(socket);
  const { showStart, closeStart, startData } = useStartGame(socket);
  const navigate = useNavigate();

  interface Message {
    nickname: string;
    message: string;
  }

  interface FriendData {
    level: number;
    nickname: string;
    status: number;
  }

  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("channel");
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [channelUser, setChannelUser] = useState<string[]>([]);
  const [showChannel, setChannel] = useState<boolean>(false);
  const [selectUser, setSelectUser] = useState<string>("");
  const [privateRoomName, setPrivateRoomName] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inviteGameSelect, setInviteGameSelect] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isChief, setIsChief] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const chatWindowRef = useRef<HTMLDivElement>(null); // create a ref for the chat window

  useEffect(() => {
    async function fetchData() {
      const res = await CustomAxios.get("/member");
      setNickname(res.data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (nickname !== "") socket.emit("setUser", { nickname: nickname });
  }, [nickname]);

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

    socket.on("isChief", () => {
      setIsChief(true);
      setIsAdmin(true);
      const newMessage: Message = {
        nickname: "<system>",
        message: " I need a weapon. - Master Cheif -",
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("isNotChief", () => {
      setIsChief(false);
      setIsAdmin(false);
    });

    socket.on("isAdmin", () => {
      setIsChief(false);
      setIsAdmin(true);
    });

    socket.on("isNotAdmin", () => {
      setIsChief(false);
      setIsAdmin(false);
    });

    socket.on("kick", () => {
      socket.emit("joinRoom", "lobby");
    });

    socket.on("newMessage", (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("addUser", (nickname: string) => {
      const newMessage: Message = {
        nickname: "@join",
        message: nickname + " has joined the room",
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("errorMessage", (message: string) => {
      const newMessage: Message = {
        nickname: "<error>",
        message: message,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("systemMessage", (message: string) => {
      const newMessage: Message = {
        nickname: "<system>",
        message: message,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("passwordRequired", (body: { roomName: string }) => {
      setPrivateRoomName(body.roomName);
      setShowPasswordModal(true);
    });
  }, []);

  const handleFriendListClick = () => {
    CustomAxios.get("/member/friend/").then((res) => {
      const friendDataArray: FriendData[] = res.data.map((friend: any) => {
        return {
          level: friend.level,
          nickname: friend.name,
          status: friend.status,
        };
      });
      setFriends(friendDataArray);
    });
    setSelectedTab("friends");
  };

  const handleChannelListClick = () => setSelectedTab("channel");



  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const goToRanking = (user: string) => {
    navigate("/rank", { state: { user } });
  };

  const goToProfile = (user: string) => {
    // You can pass user as a parameter if you need it in the profile page
    navigate(`/profile/${user}`);
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

  const addFriend = (user: string) => {
    CustomAxios.post("/member/friend/" + user)
      .then(() => {
        const newMessage: Message = {
          nickname: "<system>",
          message: ` ${user} is added to friend list.`,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          const newMessage: Message = {
            nickname: "<error>",
            message: ` ${user} not found.`,
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });
  };

  const deleteFriend = (user: string) => {
    CustomAxios.delete("/member/friend/" + user).then(() => {
      const newMessage: Message = {
        nickname: "<system>",
        message: ` ${user} is deleted from the friend list.`,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  };

  const setAdmin = (user: string) => {
    socket.emit("setAdmin", { nickname: user });
  };

  const unsetAdmin = (user: string) => {
    socket.emit("unSetAdmin", { nickname: user });
  };

  const muteUser = (user: string) => {
    socket.emit("mute", { nickname: user });
  };

  const banUser = (user: string) => {
    socket.emit("ban", { nickname: user });
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
        <Gamebuttons nickname={nickname}/>
        <div id="personal-buttons">
          <button id="profile-button" onClick={() => goToProfile(nickname)}>
            My Profile
          </button>
          <button id="logout-button" onClick={() => CustomAxios.get('/auth/logout').then(() => {removeToken(); navigate('/');})}>Logout</button>
        </div>
      </div>
      <div id="chat-interface">
        <div id="chat-box">
          <div id="chat-status">
            <div id="chat-name">{roomName}</div>
            {isAdmin === true && <div id="is-admin">Admin</div>}
            {isAdmin === true && <div id="is-cheif">Chief</div>}
          </div>
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
                          : msg.nickname === "<error>"
                            ? "error-message"
                            : ""
                    }
                  >
                    {msg.nickname === "@join" ? msg.message : (msg.nickname + ': ' + msg.message)}
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
                    key={user.nickname}
                    onClick={() => handleUserClick(user.nickname)}
                    className={
                      selectUser === user.nickname ? "user-selected" : ""
                    }
                  >
                    {user.level}
                    {user.nickname}
                    {user.status}
                    {selectUser === user.nickname && (
                      <div className="button-container">
                        <button onClick={() => goToProfile(user.nickname)}>
                          Profile
                        </button>
                        <button onClick={() => deleteFriend(user.nickname)}>
                          delete user
                        </button>
                        <button onClick={(event) => inviteGame(event)}>
                          1vs1
                        </button>
                        {inviteGameSelect === true && (
                          <div className="button-invite-type">
                            <button
                              className="button-normal-invite"
                              onClick={() =>
                                selectGametype(user.nickname, "normal")
                              }
                            >
                              Normal
                            </button>
                            <button
                              className="button-power-invite"
                              onClick={() =>
                                selectGametype(user.nickname, "Power")
                              }
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
                        <button onClick={() => goToProfile(user)}>
                          Profile
                        </button>
                        <button onClick={() => addFriend(user)}>
                          Add Friend
                        </button>
                        {isChief === true && (
                          <div id="owner-button">
                            <button onClick={() => setAdmin(user)}>
                              Set Admin
                            </button>
                            <button onClick={() => unsetAdmin(user)}>
                              Unset Admin
                            </button>
                          </div>
                        )}
                        {isAdmin === true && (
                          <div id="admin-button">
                            <button onClick={() => banUser(user)}>Ban</button>
                            <button onClick={() => muteUser(user)}>Mute</button>
                          </div>
                        )}
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
