export class GameInfoDto {
	type: number;
	roomId: string;
	playerA: string;
	playerB: string;
	side: number;
	
	constructor(type, roomId, playerA, playerB, side) {
		this.type = type;
		this.roomId = roomId;
		this.playerA = playerA;
		this.playerB = playerB;
		this.side = side;
	}
}