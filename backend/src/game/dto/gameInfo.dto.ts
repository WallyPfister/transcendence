export class GameInfoDto {
	type: number;
	playerA: string;
	playerB: string;
	
	constructor(type: number, playerA: string, playerB: string) {
		this.type = type;
		this.playerA = playerA;
		this.playerB = playerB;
	}
}