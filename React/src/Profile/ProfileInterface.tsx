export interface ProfileData {
    name: string,
    avatar: string,
    status: string,
    win: number,
    lose: number,
    score: number,
    achieve1: boolean,
    achieve2: boolean,
    achieve3: boolean,
    achieve4: boolean,
    whois: string
}

export interface HistoryProps {
    line: {
        type: number,
        name: string,
        opponent: string,
        scoreA: number,
        scoreB: number,
        time: string,
        result: boolean
    }
}