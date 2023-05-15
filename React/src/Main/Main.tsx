import React, { useState, useEffect, useRef, useContext } from "react";

import "./Main.css";
import ChannelWindow from "./Components/ChannelWindow/ChannelWindow";
import PasswordModal from "./Components/PasswordModal/PasswordModal";
import Gamebuttons from "./Components/Gamebuttons/Gamebuttons";
import { SocketContext } from "../Socket/SocketContext";
import { useNavigate } from "react-router-dom";
import { InviteGameModal, useInviteGame } from "../Socket/InviteGameModal";
import { StartGameModal, useStartGame } from "../Socket/StartGameModal";
import CustomAxios from "../Util/CustomAxios";
import { removeToken } from "../Util/errorHandler";
import { InviteFailModal, useInviteFail } from "../Socket/InviteFailedModal";

function Main() {
  const socket = useContext(SocketContext);
  const { showInvite, closeInvite, inviteData } = useInviteGame(socket);
  const { showStart, closeStart, startData } = useStartGame(socket);
  const { showInviteFail, closeInviteFail, inviteFailData } =
    useInviteFail(socket);

  const navigate = useNavigate();

  interface Message {
    type: number; // 0: msg, 1: privmsg, 2: system, 3:error
    nickname: string | null;
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
  const [passwordMode, setPasswordMode] = useState<string>("");
  const [inviteGameSelect, setInviteGameSelect] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isChief, setIsChief] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [privateUser, setPrivateUser] = useState<string>("");
  const [blackList, setBlackList] = useState<string[]>([]);

  const chatWindowRef = useRef<HTMLDivElement>(null); // create a ref for the chat window

  useEffect(() => {
    async function fetchData() {
      const res = await CustomAxios.get("/member");
      setNickname(res.data);
      CustomAxios.get("/member/black/").then((res) => {
        const blackedDataArray: string[] = res.data;
        setBlackList(blackedDataArray);
      });
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

  useEffect(() => {}, [friends, blackList]);

  const addMessage = (nickname: string, message: string) => {
    const newMessage: Message = {
      type: 0,
      nickname: nickname,
      message: message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const addPrivateMessage = (nickname: string, message: string) => {
    const newMessage: Message = {
      type: 1,
      nickname: nickname,
      message: message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const addSystemMessage = (message: string) => {
    const newMessage: Message = {
      type: 2,
      nickname: null,
      message: message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const addErrorMessage = (message: string) => {
    const newMessage: Message = {
      type: 3,
      nickname: null,
      message: message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.IO connected!");
    });

    socket.on("joinRoom", (data: { roomName: string }) => {
      setRoomName(data.roomName);
      setMessages([]);
    });

    socket.on("userList", (userList: string[]) => {
      setSelectUser("");
      setChannelUser(userList);
    });

    socket.on("isChief", () => {
      setIsChief(true);
      setIsAdmin(true);
      addSystemMessage("I need a weapon. -Master Chief-");
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
      socket.emit("joinRoom", { roomId: "lobby" });
    });

    socket.on("newMessage", (newMessage: any) => {
      addMessage(newMessage.nickname, newMessage.message);
    });

    socket.on("privateMessage", ({ nickname, message }) => {
      addPrivateMessage(nickname, message);
    });

    socket.on("addUser", (nickname: string) => {
      addSystemMessage(nickname + " has joined the room");
    });

    socket.on("errorMessage", (message: string) => {
      addErrorMessage(message);
    });

    socket.on("systemMessage", (message: string) => {
      addSystemMessage(message);
    });

    socket.on("passwordRequired", (body: { roomName: string }) => {
      setPasswordMode("join");
      setPrivateRoomName(body.roomName);
      setShowPasswordModal(true);
    });

	socket.on("duplicateUser", () => {
		navigate("/");
	});

    return () => {
      socket.off("connect");
      socket.off("joinRoom");
      socket.off("userList");
      socket.off("isChief");
      socket.off("isNotChief");
      socket.off("isAdmin");
      socket.off("isNotAdmin");
      socket.off("kick");
      socket.off("newMessage");
      socket.off("privateMessage");
      socket.off("addUser");
      socket.off("errorMessage");
      socket.off("systemMessage");
      socket.off("passwordRequired");
	  socket.off("duplicateUser");
    };
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
    CustomAxios.get("/member/black/").then((res) => {
      const blackedDataArray: string[] = res.data;
      setBlackList(blackedDataArray);
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

  const goToProfile = (user: string) => {
    navigate(`/profile/${user}`);
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isComposing) {
      if (isPrivate === true) {
        socket.emit("privateMessage", {
          nickname: privateUser,
          message: message,
        });
        addPrivateMessage("to " + privateUser, message);
        setPrivateUser("");
        setIsPrivate(false);
      } else {
        socket.emit("sendMessage", { message: message });
      }
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

  const handleChangePasswordClick = () => {
    setPasswordMode("change");
    setShowPasswordModal(true);
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
        addSystemMessage(user + " is added to friend list.");
      })
      .catch((err) => {
        if (err.response.status === 404) {
          addErrorMessage(user + " not found.");
        }
        if (err.response.status === 409) {
          addErrorMessage(user + " is alreay in friend list.");
        }
      });
  };

  const deleteFriend = (user: string) => {
    CustomAxios.delete("/member/friend/" + user).then(() => {
      addSystemMessage(user + " is deleted from the friend list.");
      handleFriendListClick();
    });
  };

  const blackUser = (user: string) => {
    CustomAxios.post("/member/black/" + user)
      .then(() => {
        addSystemMessage(user + " is added to Blacked list.");
        CustomAxios.get("/member/black/").then((res) => {
          const blackedDataArray: string[] = res.data;
          setBlackList(blackedDataArray);
        });
      })
      .catch((err) => {
        if (err.response.status === 404) {
          addErrorMessage(user + " not found.");
        }
        if (err.response.status === 409) {
          addErrorMessage(user + " is alreay blocked.");
        }
      });
  };

  const unBlackUser = (user: string) => {
    CustomAxios.delete("/member/black/" + user).then(() => {
      addSystemMessage(user + "is deleted from the Blacked list.");
      handleFriendListClick();
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

  const kickUser = (user: string) => {
    socket.emit("kick", { nickname: user });
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
    addSystemMessage(` You challanged ${user} to a ${type} dual.`);
    setInviteGameSelect(false);
  };

  const handlePasswordSubmit = (submit: any) => {
    if (submit.status === "join")
      socket.emit("sendPassword", {
        roomId: submit.roomId,
        password: submit.password,
      });
    if (submit.status === "change") {
      socket.emit("changeRoomPassword", { password: submit.password });
      console.log(submit.password);
    }
    console.log(submit);
    setShowPasswordModal(false);
  };

  const privateMode = (user: string) => {
    setMessage("");
    setPrivateUser(user);
    setIsPrivate(true);
  };

  return (
    <div id="main">
      <div id="top-buttons">
        <Gamebuttons nickname={nickname} />
        <div id="personal-buttons">
          <button id="profile-button" onClick={() => goToProfile(nickname)}>
            My Profile
          </button>
          <button
            id="logout-button"
            onClick={() =>
              CustomAxios.get("/auth/logout").then(() => {
                removeToken();
                navigate("/");
              })
            }
          >
            Logout
          </button>
        </div>
      </div>
      <div id="chat-interface">
        <div id="chat-box">
          <div id="chat-status">
            <div id="chat-name">{roomName}</div>
            <div id="chat-authority">
              {isChief === true && <div id="is-cheif">Chief</div>}
              {isAdmin === true && <div id="is-admin">Admin</div>}
            </div>
          </div>
          <div id="chat-window" ref={chatWindowRef}>
            {messages.map(
              (msg: Message, index: number) =>
                msg.message !== "" && (
                  <div
                    key={index}
                    style={{ marginBottom: "8px", marginTop: "8px" }}
                    className={
                      msg.nickname === nickname
                        ? "my-message"
                        : blackList.includes(msg.nickname || "")
                        ? "blocked"
                        : msg.type === 1
                        ? "private-message"
                        : msg.type === 2
                        ? "system-message"
                        : msg.type === 3
                        ? "error-message"
                        : ""
                    }
                  >
                    {msg.nickname === null
                      ? msg.message
                      : msg.nickname + ": " + msg.message}
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
            placeholder={isPrivate ? `${privateUser}` : ""}
            className={isPrivate ? "private-input" : ""}
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
                <button id="friends">Friends</button>
                {friends.map((user) => (
                  <div
                    key={user.nickname}
                    onClick={() => handleUserClick(user.nickname)}
                    style={{ marginBottom: "8px", marginTop: "8px" }}
                    className={
                      selectUser === user.nickname ? "user-selected" : ""
                    }
                  >
                    <div
                      className={`${
                        user.status === 0
                          ? "offline"
                          : user.status === 1
                          ? "online"
                          : "busy"
                      }`}
                    >
                      LV {user.level} {user.nickname}
                    </div>
                    {selectUser === user.nickname && (
                      <div className="button-container">
                        <button onClick={() => goToProfile(user.nickname)}>
                          Profile
                        </button>
                        <button onClick={() => privateMode(user.nickname)}>
                          Private Message
                        </button>
                        <button onClick={() => deleteFriend(user.nickname)}>
                          Delete Friend
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
                                selectGametype(user.nickname, "power")
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
                <button id="blacked">Blacked</button>
                {blackList.map((user) => (
                  <div
                    key={user}
                    onClick={() => handleUserClick(user)}
                    style={{ marginBottom: "8px", marginTop: "8px" }}
                    className={selectUser === user ? "user-selected" : ""}
                  >
                    {user}
                    {selectUser === user && (
                      <button onClick={() => unBlackUser(user)}>Unblack</button>
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
                    style={{ marginBottom: "8px", marginTop: "8px" }}
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
                            <button onClick={() => kickUser(user)}>kick</button>
                            <button onClick={() => muteUser(user)}>Mute</button>
                          </div>
                        )}
                        <button onClick={() => blackUser(user)}>Black</button>
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
                              onClick={() => selectGametype(user, "power")}
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
            {!showChannel && isChief === true && (
              <button id="change-password" onClick={handleChangePasswordClick}>
                Change Password
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
            status={passwordMode}
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
      {showInviteFail && (
        <div className="invite-fail-overlay">
          <InviteFailModal
            onClose={closeInviteFail}
            inviteFailData={inviteFailData}
          />
        </div>
      )}
    </div>
  );
}

export default Main;
