import "./InviteGameModal.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

export function useInviteGame(socket: Socket) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState(null);


  useEffect(() => {
    socket.on("invite", (data: any) => {
      setInviteData(data);
      setShowInvite(true);
      console.log(data);
    });
  }, []);

  return { showInvite, closeInvite: () => setShowInvite(false), inviteData };
}

type Props = {
  onClose: () => void;
  socket: Socket;
  inviteData: any;
};

export function InviteGameModal(props: Props) {
  const handleAccept = () => {
    props.socket.emit("inviteAccept", {
      type: props.inviteData.gameType,
      inviterName: props.inviteData.inviter,
    });
    console.log(props.inviteData.inviter);
    props.onClose();
  };

  const handleDecline = () => {
    props.socket.emit("inviteReject", props.inviteData.inviter);
    props.onClose();
  };

  return (
    <div className="invite-modal">
      {`${props.inviteData.inviter} has invited you to game type ${props.inviteData.gameType}`}
      <button className="invite-accept" onClick={handleAccept}>
        accept
      </button>
      <button className="invite-refuse" onClick={handleDecline}>
        decline
      </button>
    </div>
  );
}