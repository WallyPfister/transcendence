import RankUser from './RankUser';
import './Rank.css'
import { useQuery } from 'react-query';
import CustomAxios from '../Util/CustomAxios';
import NotFound from '../Etc/NotFound';
import { useContext } from 'react';
import { SocketContext } from '../Socket/SocketContext';
import { SocketModalContainer } from '../Socket/SocketModal';

const getRankData = async () => {
    const res = await CustomAxios.get('/member/ranking');
    return res.data;
}

function Rank() {
    const socket = useContext(SocketContext);

    const { data, isLoading, isError } = useQuery('rank-data', getRankData, {retry: false, staleTime: 60 * 1000, refetchOnMount: 'always'});

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
            <SocketModalContainer socket={socket}/>
        </div>
    )
}

export default Rank;