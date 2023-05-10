import RankUser from './RankUser';
import './Rank.css'

function Rank() {
    const users = [
        {
            "tier": 5,
            "name": "sojoo",
            "point": 200,
            "win": 77,
            "lose": 0
        }, {
            "tier": 4,
            "name": "sokim",
            "point": 199,
            "win": 50,
            "lose": 1
        }, {
            "tier": 3,
            "name": "yachoi",
            "point": 158,
            "win": 33,
            "lose": 20
        }, {
            "tier": 2,
            "name": "sunghkim",
            "point": 101,
            "win": 29,
            "lose": 22
        }, {
            "tier": 1,
            "name": "hyunjcho",
            "point": 91,
            "win": 17,
            "lose": 15
        }, {
            "tier": 0,
            "name": "heeskim",
            "point": 22,
            "win": 3,
            "lose": 2
        }
    ];

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
                    users.map((user, idx) => (
                        <RankUser user={user} idx={idx}/>
                    ))
                }
            </div>
        </div>
    )
}

export default Rank;