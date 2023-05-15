import React, { useEffect, useState } from "react";
import "./ChannelWindow.css";

function ChannelWindow(props: any) {
  const [channelName, setChannelName] = useState<string>("");
  const [channelList, setChannelList] = useState<string[]>([]);
  const [password, setPassword] = useState<string>("");

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleChanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      props.socket.emit("createRoom", {
        roomId: channelName,
        password: password,
      });
      props.setChannel(false);
    }
  };

  const handleChannelClick = (channelName: string) => {
    props.socket.emit("joinRoom", { roomId: channelName });
    props.setChannel(false);
  };

  useEffect(() => {
    props.socket.on("channelList", (list: string[]) => {
      setChannelList(list);
    });
  }, [props.socket]);

  return (
    <div id="channel-modal" onClick={props.onClose}>
      <div id="channel-list-area" onClick={handleModalClick}>
        <div id="channel-list">
          {channelList.map((channel) => (
            <div key={channel} onClick={() => handleChannelClick(channel)}>
              {channel}
            </div>
          ))}
        </div>
        <div id="create-channel">
          <input
            id="channel-name"
            type="text"
            placeholder="new channel"
            maxLength={24}
            value={channelName}
            onChange={(e) => {
              const inputValue = e.target.value;
              const sanitizedValue = inputValue.replace(/[^a-zA-Z0-9]/g, "");
              setChannelName(sanitizedValue);
            }}
            onKeyDown={(e) => handleChanKeyDown(e)}
          />
          <input
            id="channel-password"
            type="text"
            placeholder="password"
            value={password}
            maxLength={8}
            onChange={(e) => {
              const inputValue = e.target.value;
              const sanitizedValue = inputValue.replace(/[^0-9]/g, "");
              setPassword(sanitizedValue);
            }}
            onKeyDown={(e) => handleChanKeyDown(e)}
          />
        </div>

        <button onClick={props.onClose}>Close</button>
      </div>
    </div>
  );
}

export default ChannelWindow;
