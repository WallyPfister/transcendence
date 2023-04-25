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
        <div id="rank-user">
            <div id="user-number">{idx}</div>
            <div id="user-player">
                <img id="tier-img" src={tierImg} alt="img"></img>
                <div id="name">{user.name}</div>
            </div>
            <div id="user-point">{user.point}</div>
            <div id="user-win">{user.win}</div>
            <div id="user-lose">{user.lose}</div>
        </div>
    )
}

export default RankUser;