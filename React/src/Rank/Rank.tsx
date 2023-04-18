import RankUser from './RankUser';
import './Rank.css'

function Rank() {
    return (
        <div id="Rank">
            <div id="title">Rank 👑</div>
            <div id="wrapper">
                <div id="column">
                    <div id="number">Rank</div>
                    <div id="player">Player</div>
                    <div id="point">Point</div>
                    <div id="win">Win</div>
                    <div id="lose">Lose</div>
                </div>
                {/*map으로 user들 띄우기*/}
                <RankUser/>
            </div>
        </div>
    )
}

export default Rank;