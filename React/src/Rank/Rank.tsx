import RankUser from './RankUser';
import './Rank.css'
import { useQuery } from 'react-query';
import CustomAxios from '../Util/CustomAxios';
import NotFound from '../Etc/NotFound';
import { StartGameModal, useStartGame } from '../Socket/StartGameModal';
import { InviteFailModal, useInviteFail } from '../Socket/InviteFailedModal';
import { InviteGameModal, useInviteGame } from '../Socket/InviteGameModal';
import { useContext } from 'react';
import { SocketContext } from '../Socket/SocketContext';

const getRankData = async () => {
    const res = await CustomAxios.get('/member/ranking');
    return res.data;
}

function Rank() {
    const socket = useContext(SocketContext);

    const { data, isLoading, isError } = useQuery('rank-data', getRankData, {retry: false, staleTime: 60 * 1000, refetchOnMount: 'always'});
    const { showInvite, closeInvite, inviteData } = useInviteGame(socket);
    const { showStart, closeStart, startData } = useStartGame(socket);
    const { showInviteFail, closeInviteFail, inviteFailData } =
      useInviteFail(socket);

    if (isLoading)
        return (<img src="../img/spinner.gif" alt="img"></img>);
    if (isError)
        return (<NotFound/>)

    return (
        <div id="rank">
            <div id="title">Ranking 👑</div>
            <div id="wrapper">
                <div id="column">
                    <div id="number">Rank</div>
                    <div id="player">Player</div>
                    <div id="point">Point</div>
                    <div id="win">Win</div>
                    <div id="lose">Lose</div>
                </div>
                {
                    data.length === 0 ? <div id="no-user">No User</div> :
                    data.map((user, idx) => (
                        <RankUser user={user} idx={idx} key={idx}/>
                    ))
                }
            </div>
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
    )
}

export default Rank;