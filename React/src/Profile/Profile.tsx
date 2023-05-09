import { useQuery } from 'react-query';
import { HistoryProps, ProfileData } from './ProfileInterface';
import HistoryLine from './HistoryLine';
import './Profile.css';
import CustomAxios from '../Etc/CustomAxios';
import { AxiosResponse } from 'axios';
import { NavigateFunction, useNavigate } from 'react-router-dom';

const getProfileData = (user: string): Promise<ProfileData> => {
    return new Promise<ProfileData>(async (resolve, reject) => {
            try {
                const res: AxiosResponse = await CustomAxios.get('/member/userProfile', {params: {userName: user}});
                const status: string = res.data.status === 0 ? 'OFFLINE' : (res.data.status === 1 ? 'ONLINE' : (res.data.status === 2 ? 'WAIT' : 'IN-GAME'));
                const achieve: Array<string> = String(res.data.achieve).split('');
                const who: string = res.data.whois === 0 ? 'me' : (res.data.whois === 1 ? 'del' : 'add');
                const data: ProfileData = {
                    "name": res.data.name,
                    "avatar": res.data.avatar,
                    "status": status,
                    "win": res.data.win,
                    "lose": res.data.los,
                    "score": res.data.score,
                    "achieve1": achieve[0] === '0' ? false : true,
                    "achieve2": achieve[0] === '0' ? false : true,
                    "achieve3": achieve[0] === '0' ? false : true,
                    "achieve4": achieve[0] === '0' ? false : true,
                    "whois": who
                };
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    );
}

const getHistory = async (user: string): Promise<Array<HistoryProps>> => {
    const res = await CustomAxios.get('/member/history', {params: {name: user}});
    return res.data;
}

function Profile() {
    const nav: NavigateFunction = useNavigate();
    const userName: string = window.location.pathname.split('/')[2];
    const { data: profileData, isLoading, isError } = useQuery<ProfileData>('profile-data', ()=>getProfileData(userName), {retry: false});
    const { data: history } = useQuery<Array<HistoryProps>>('history-data', ()=>getHistory(userName), {retry: false});

    if (isLoading)
        return (<>Loading</>);
    if (isError)
        nav('/not-found');

    console.log(profileData);
    console.log(history);

    return (
        <>
        {
            profileData && history && (
                <div id="profile">
                    <div id="left-wrapper">
                        <div id="user-info">
                            <div id="img-wrapper">
                                <img id="avatar" src="suzume.jpg" alt="img"></img>
                            </div>
                            <div id="name-button-wrapper">
                                <div id="name">{profileData.name}</div>
                                <label className={profileData.status}><button id="friend" className={profileData.whois}></button>{profileData.status}</label>
                            </div>
                        </div>
                        <div id="stat">
                            <div id="stat-title">STAT</div>
                            <div id="stat-content">
                                <div id="level-wrapper">
                                    <img id="tier" src="tier5.png" alt="img"></img>
                                    <div id="point">{profileData.score} pt</div>
                                </div>
                                <div id="win-lose">{profileData.win}W / {profileData.lose}L<br/>{(profileData.win / (profileData.win + profileData.lose) * 100).toFixed(2)}%</div>
                                <div id="achieve">
                                    <div id="achieve-1">
                                        <img className="off" src={'achieve-' + (profileData.achieve1 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Win 5 times in a row</p>
                                    </div>
                                    <div id="achieve-2">
                                        <img className="off" src={'achieve-' + (profileData.achieve2 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Win 10 times in a row</p>
                                    </div>
                                    <div id="achieve-3">
                                        <img className="off" src={'achieve-' + (profileData.achieve3 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Perfect game winner</p>
                                    </div>
                                    <div id="achieve-4">
                                        <img className="off" src={'achieve-' + (profileData.achieve4 ? 'star' : 'non') + '.svg'} alt="img"></img>
                                        <p>Master Hunter</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="history-wrapper">
                        <div id="history-title">HISTORY</div>
                        <div id="history-content">
                            {/* {
                                history.map((line, idx) => (
                                    <HistoryLine line={line} key={idx}/>
                                ))
                            } */}
                        </div>
                    </div>
                </div>
            )
        }
        </>
    )
}

export default Profile;