import React, { useState } from "react";

import "./PasswordModal.css";

type Props = {
  onSubmit: (body: any) => void;
  privateRoomName: string;
  status: string;
};

const PasswordModal = (props: Props) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (props.status === "join")
      props.onSubmit({
        status: "join",
        roomId: props.privateRoomName,
        password: password,
      });
    else if (props.status === "change")
      props.onSubmit({
        status: "change",
        roomId: props.privateRoomName,
        password: password,
      });
  };

  return (
    <div className="password-modal">
      Enter Password
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />
      </form>
    </div>
  );
};

export default PasswordModal;
