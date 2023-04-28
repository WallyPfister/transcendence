import './HistoryLine.css';

interface HistoryProps {
    line: {
        type: number,
        name: string,
        opponent: string,
        scoreA: number,
        scoreB: number,
        time: string
        result: boolean
    }
}

function HistoryLine(props: HistoryProps) {
    const line: HistoryProps["line"] = props.line;

    return (
        <div className="history-line">
            <div className="date">{line.time}</div>
            <div className="type">
                {
                    line.type === 0 ? '1 vs 1' : 'Rank'
                }
            </div>
            <div className="opponent">{line.name} : {line.opponent}</div>
            <div className="score">{line.scoreA} : {line.scoreB}</div>
            {
                line.result === true ? <div className="win">WIN</div> : <div className="lose">LOSE</div>
            }
        </div>
    )
}

export default HistoryLine;