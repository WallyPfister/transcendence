import HistoryLine from './HistoryLine';
import './Profile.css';

function Profile() {
    const winLose: string = "77W / 0L\n100%";
    const historyline = [
        {
            "type": 1,
            "name": 'minjaekimw',
            "opponent": 'junhyuki2',
            "scoreA": 3,
            "scoreB": 0,
            "time": '11.21',
            "result": true
        }, {
            "type": 0,
            "name": 'sunghkim',
            "opponent": 'yachoi',
            "scoreA": 3,
            "scoreB": 0,
            "time": '04.21',
            "result": false
        }
    ]

    return (
        <div id="profile">
            <div id="left-wrapper">
                <div id="user-info">
                    <div id="img-wrapper">
                        <img id="avatar" src="suzume.jpg" alt="img"></img>
                    </div>
                    <div id="name-button-wrapper">
                        <div id="name">minhojan</div>
                        <label><button id="friend" className="add"></button>OFFLINE</label>
                    </div>
                </div>
                <div id="stat">
                    <div id="stat-title">STAT</div>
                    <div id="stat-content">
                        <div id="level-wrapper">
                            <img id="tier" src="tier5.png" alt="img"></img>
                            <div id="point">200 pt</div>
                        </div>
                        <div id="win-lose">{winLose}</div>
                        <div id="achieve">
                            <div id="achieve-1">
                                <img className="off" src="achieve-non.svg" alt="img"></img>
                                <p>Win 10 times in a row</p>
                            </div>
                            <div id="achieve-2">
                                <img className="off" src="achieve-non.svg" alt="img"></img>
                                <p>Win 5 times in a row</p>
                            </div>
                            <div id="achieve-3">
                                <img className="off" src="achieve-non.svg" alt="img"></img>
                                <p>Perfect game winner</p>
                            </div>
                            <div id="achieve-4">
                                <img className="off" src="achieve-non.svg" alt="img"></img>
                                <p>Master Hunter</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="history-wrapper">
                <div id="history-title">HISTORY</div>
                <div id="history-content">
                    {
                        historyline.map(line => (
                            <HistoryLine line={line}/>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Profile;