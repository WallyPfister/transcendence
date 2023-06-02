import "./InviteFailedModal.css";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface InviteFailData {
  name: string;
  state: string;
}

export function useInviteFail(socket: Socket) {
  const [showInviteFail, setShowInviteFail] = useState(false);
  const [inviteFailData, setInviteFailData] = useState<InviteFailData>(null);

  useEffect(() => {
    socket.on("lost", (user: string) => {
      const data: InviteFailData = { name: user, state: "lost" };
      setInviteFailData(data);
      setShowInviteFail(true);
    });

    socket.on("rejectedGame", (user: string) => {
      const data: InviteFailData = { name: user, state: "rejectedGame" };
      setInviteFailData(data);
      setShowInviteFail(true);
      console.log(data);
    });

    return () => {
      socket.off("lost");
      socket.off("rejectedGame");
    };
  }, []);

  return {
    showInviteFail,
    closeInviteFail: () => setShowInviteFail(false),
    inviteFailData,
  };
}

type Props = {
  onClose: () => void;
  inviteFailData: InviteFailData;
};

export function InviteFailModal(props: Props) {
  const handleClose = () => {
    props.onClose();
  };

  return (
    <div className="invite-fail-modal">
      {props.inviteFailData.state === "lost" && (
        <div id="invite-lost">no more user: {props.inviteFailData.name}.</div>
      )}
      {props.inviteFailData.state === "rejectedGame" && (
        <div id="invite-reject">Invite request declined by {props.inviteFailData.name}.</div>
      )}
      <button className="invite-fail-confirm" onClick={handleClose}>
        confirm
      </button>
    </div>
  );
}
