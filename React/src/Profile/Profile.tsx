import { useQuery } from 'react-query';
import Swal from 'sweetalert2';
import { HistoryData, ProfileData } from './ProfileInterface';
import HistoryLine from './HistoryLine';
import './Profile.css';
import CustomAxios from '../Util/CustomAxios';
import { AxiosResponse } from 'axios';
import NotFound from '../Etc/NotFound';
import { useContext } from 'react';
import { SocketContext } from '../Socket/SocketContext';
import { InviteGameModal, useInviteGame } from '../Socket/InviteGameModal';
import { StartGameModal, useStartGame } from '../Socket/StartGameModal';

const getProfileData = (user: string): Promise<ProfileData> => {
    return new Promise<ProfileData>(async (resolve, reject) => {
            try {
                const res: AxiosResponse = await CustomAxios.get('/member/profile', {params: {userName: user}});
                const status: string = res.data.status === 0 ? 'OFFLINE' : (res.data.status === 1 ? 'ONLINE' : (res.data.status === 2 ? 'WAIT' : 'IN-GAME'));
                const achieve: Array<number> = calcAchieve(res.data.achieve);
                const who: string = res.data.whois === 0 ? 'me' : (res.data.whois === 1 ? 'del' : 'add');
                const level = res.data.level > 5 ? 5 : res.data.level;
                const data: ProfileData = {
                    "name": res.data.name,
                    "avatar": res.data.avatar,
                    "status": status,
                    "win": res.data.win,
                    "lose": res.data.lose,
                    "level": level,
                    "score": res.data.score,
                    "achieve1": achieve[3] === 0 ? false : true,
                    "achieve2": achieve[2] === 0 ? false : true,
                    "achieve3": achieve[1] === 0 ? false : true,
                    "achieve4": achieve[0] === 0 ? false : true,
                    "whois": who
                };
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    );
}

const calcAchieve = (achieve: number) => {
    let bit = 1;
    let arr = [0, 0, 0, 0];

    for (let i = 0; i < 4; i++) {
        if ((achieve & bit) === bit)
            arr[i] = 1;
        else
            arr[i] = 0;
        bit = bit << 1;
    }
    return arr;
}

const getHistory = async (user: string): Promise<Array<HistoryData>> => {
    const res = await CustomAxios.get('/member/history', {params: {name: user}});
    return res.data;
}

function Profile() {
    const userName: string = window.location.pathname.split('/')[2] || '@'; 
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery<ProfileData>('profile-data-' + userName, ()=>getProfileData(userName), {retry: false, staleTime: 60 * 1000, refetchOnMount: 'always'});
    const { data: history, isLoading: historyLoading, isError: histotyError } = useQuery<Array<HistoryData>>('history-data' + userName, ()=>getHistory(userName), {retry: false, staleTime: 60 * 1000, refetchOnMount: 'always'});
    const socket = useContext(SocketContext);
    const { showInvite, closeInvite, inviteData } = useInviteGame(socket);
    const { showStart, closeStart, startData } = useStartGame(socket);

    if (profileLoading || historyLoading)
        return (<img src="../img/spinner.gif" alt="img"></img>);
    if (profileError || histotyError)
        return (<NotFound/>);

    const friendButton = (event: React.MouseEvent) => {
        const target = event.target as HTMLButtonElement;
        if (profileData && !target.classList.contains('me')) {
            Swal.fire({
                text: (target.classList.contains('del') ? 'Remove' : 'Add') + ' as a friend?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK'
            }).then((res) => {
                if (res.isConfirmed) {
                    if (target.classList.contains('del'))
                        CustomAxios.delete('/member/friend/' + profileData.name).then(() => {
                            Swal.fire('Complete!');
                            target.classList.remove('del');
                            target.classList.add('add');
                        });
                    else if (target.classList.contains('add'))
                        CustomAxios.post('/member/friend/' + profileData.name).then((res) => {
                            Swal.fire('Complete!');
                            target.classList.remove('add');
                            target.classList.add('del');
                        })
                        .catch((err) => {if (err.response.status === 404) Swal.fire('No such user')});
                }
            });
        }
    }

    return (
        <>
        {
            profileData && history && (
                <div id="profile">
                    <div id="left-wrapper">
                        <div id="user-info">
                            <div id="avatar" style={{backgroundImage: `url(${profileData.avatar})`}}></div>
                            <div id="name-button-wrapper">
                                <div id="name">{profileData.name}</div>
                                <label className={profileData.status}><button id="friend" className={profileData.whois} onClick={friendButton}></button>{profileData.status}</label>
                            </div>
                        </div>
                        <div id="stat">
                            <div id="stat-title">STAT</div>
                            <div id="stat-content">
                                <div id="level-wrapper">
                                    <img id="tier" src={"../img/tier" + profileData.level + ".png"} alt="img"></img>
                                    <div id="point">{profileData.score} pt</div>
                                </div>
                                <div id="win-lose">{profileData.win}W / {profileData.lose}L<br/>{profileData.win === 0 ? '0' : (profileData.win / (profileData.win + profileData.lose) * 100).toFixed(2)}%</div>
                                <div id="achieve">
                                    <div id="achieve-1">
                                        <img className="off" src={'../img/achieve-' + (profileData.achieve1 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Win 5 times in a row</p>
                                    </div>
                                    <div id="achieve-2">
                                        <img className="off" src={'../img/achieve-' + (profileData.achieve2 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Win 10 times in a row</p>
                                    </div>
                                    <div id="achieve-3">
                                        <img className="off" src={'../img/achieve-' + (profileData.achieve3 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Perfect game winner</p>
                                    </div>
                                    <div id="achieve-4">
                                        <img className="off" src={'../img/achieve-' + (profileData.achieve4 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Master Hunter</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="history-wrapper">
                        <div id="history-title">HISTORY</div>
                        {
                            history.length === 0 ? (<div style={{textAlign: 'center', marginTop: '30px'}}>No Result</div>) : null
                        }
                        <div id="history-content">
                            {
                                history.map((line, idx) => (
                                    <HistoryLine line={line} key={idx}/>
                                ))
                            }
                        </div>
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
                </div>
            )
        }
        </>
    )
}

export default Profile;