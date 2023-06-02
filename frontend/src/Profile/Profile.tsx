import { useQuery } from 'react-query';
import { useContext } from 'react';
import { SocketContext } from '../Socket/SocketContext';
import { SocketModalContainer } from '../Socket/SocketModal';
import { HistoryData, ProfileData } from './ProfileInterface';
import { GetData } from './GetData';
import HistoryLine from './HistoryLine';
import NotFound from '../NotFound/NotFound';
import friendButton from './friendButton';
import './Profile.css';

function Profile() {
    const userName = window.location.pathname.split('/')[2] || '@';
    const socket = useContext(SocketContext);
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery<ProfileData>('profile-data-' + userName, ()=>GetData.getProfileData(userName), {retry: false, staleTime: 60 * 1000, refetchOnMount: 'always'});
    const { data: history, isLoading: historyLoading, isError: histotyError } = useQuery<Array<HistoryData>>('history-data' + userName, ()=>GetData.getHistory(userName), {retry: false, staleTime: 60 * 1000, refetchOnMount: 'always'});

    if (profileLoading || historyLoading)
        return (<img src="../img/spinner.gif" alt="img"></img>);
    if (profileError || histotyError)
        return (<NotFound/>);

    return (
        <>
        <SocketModalContainer socket={socket}/>
        {
            profileData && history && (
                <div id="profile">
                    <div id="left-wrapper">
                        <div id="user-info">
                            <div id="avatar" style={{backgroundImage: `url(${profileData.avatar})`}}></div>
                            <div id="name-button-wrapper">
                                <div id="name">{profileData.name}</div>
                                <label className={profileData.status}><button id="friend" className={profileData.whois} onClick={(e)=>friendButton(e, profileData)}></button>{profileData.status}</label>
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
                                        <p>Win 5 times</p>
                                    </div>
                                    <div id="achieve-2">
                                        <img className="off" src={'../img/achieve-' + (profileData.achieve2 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Win 10 times</p>
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
                </div>
            )
        }
        </>
    )
}

export default Profile;