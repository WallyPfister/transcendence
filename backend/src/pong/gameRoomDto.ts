import { Ball } from "./pong.interface";
import { Player } from "./pong.interface";

export interface gameRoomDto {
	ball: Ball;
	playerA: Player;
	playerB: Player;
}

export class test{
	private A: string;
	private B: number;

	constructor(A: string, B: number){
		this.A = A;
		this.B = B;
	}
}