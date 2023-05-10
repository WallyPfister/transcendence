export class GameInfoDto {
	type: number;
	roomId: string;
	playerA: string;
	playerB: string;
	
	constructor(type: number, roomId:string, playerA: string, playerB: string) {
		this.type = type;
		this.roomId = roomId;
		this.playerA = playerA;
		this.playerB = playerB;
	}
}