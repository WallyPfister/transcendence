import React, { useState } from "react";

import "./PasswordModal.css";

type Props = {
  onSubmit: (body: any) => void;
  privateRoomName: string;
};

const PasswordModal = (props: Props) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmit({ roomId: props.privateRoomName, password: password });
  };

  return (
    <div className="password-modal">
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PasswordModal;
