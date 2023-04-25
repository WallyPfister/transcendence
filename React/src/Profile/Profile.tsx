import './Profile.css';

function Profile() {
    return (
        <div id="profile">
            <div id="left-wrapper">
                <div id="user-info">
                    <div id="img-wrapper">
                        <img id="avatar" src="suzume.jpg" alt="img"></img>
                    </div>
                    <div id="name">sunghkim</div>
                    <button id="friend" className="add"></button>
                </div>
                <div id="stat">
                    <div id="stat-title">STAT</div>
                    <div id="level-wrapper">
                        <img id="tier" src="tier5.png" alt="img"></img>
                        <div id="point">pt</div>
                    </div>
                    <div id="win-lose"></div> {/*\n 넣어서 두줄*/}
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
            <div id="history-wrapper">
                <div id="history-title">HISTORY</div>
                {/*history map*/}
            </div>
        </div>
    )
}

export default Profile;