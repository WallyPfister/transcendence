import { UserProps } from './RankInterface';
import './RankUser.css'

function RankUser({user, idx}: UserProps) {
    return (
        <div className="rank-user">
            <div className="user-number">{idx + 1}</div>
            <div className="user-player">
                <img className="tier-img" src={'../img/tier' + (user.level > 5 ? 5 : user.level) + '.png'} alt="img"></img>
                <div className="name">{user.name}</div>
            </div>
            <div className="user-point">{user.score}</div>
            <div className="user-win">{user.win}</div>
            <div className="user-lose">{user.lose}</div>
        </div>
    )
}

export default RankUser;