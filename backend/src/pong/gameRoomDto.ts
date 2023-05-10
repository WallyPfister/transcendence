import { Ball } from "./pong.interface";
import { Player } from "./pong.interface";

export interface gameRoomDto {
	ball: Ball;
	playerA: Player;
	playerB: Player;
	type: string;
}