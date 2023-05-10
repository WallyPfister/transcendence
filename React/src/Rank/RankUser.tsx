import './RankUser.css'

interface UserProps {
    user: {
        tier: number,
        name: string,
        point: number,
        win: number,
        lose: number
    },
    idx: number
}

function RankUser(props: UserProps) {
    const user: UserProps["user"] = props.user;
    const idx: number = props.idx + 1;
    const tierImg: string = `tier${user.tier}.png`;

    return (
        <div className="rank-user">
            <div className="user-number">{idx}</div>
            <div className="user-player">
                <img className="tier-img" src={tierImg} alt="img"></img>
                <div className="name">{user.name}</div>
            </div>
            <div className="user-point">{user.point}</div>
            <div className="user-win">{user.win}</div>
            <div className="user-lose">{user.lose}</div>
        </div>
    )
}

export default RankUser;