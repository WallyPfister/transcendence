import './RankUser.css'

interface UserProps {
    user: {
        level: number,
        name: string,
        score: number,
        win: number,
        lose: number
    },
    idx: number
}

function RankUser({user, idx}: UserProps) {
    const tier = (user.level > 5) ? 5 : user.level;

    return (
        <div className="rank-user">
            <div className="user-number">{idx + 1}</div>
            <div className="user-player">
                <img className="tier-img" src={'../img/tier' + tier + '.png'} alt="img"></img>
                <div className="name">{user.name}</div>
            </div>
            <div className="user-point">{user.score}</div>
            <div className="user-win">{user.win}</div>
            <div className="user-lose">{user.lose}</div>
        </div>
    )
}

export default RankUser;