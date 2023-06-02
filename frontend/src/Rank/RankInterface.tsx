export interface UserProps {
    user: {
        level: number,
        name: string,
        score: number,
        win: number,
        lose: number
    },
    idx: number
}