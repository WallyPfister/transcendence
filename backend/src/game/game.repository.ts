import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GameRepository {
	constructor(private prisma: PrismaService) { }

	async createHistory(roomId: string, name: string, opponent: string, scoreA: number, scoreB: number, result: boolean, type: number): Promise<void> {
		try {
			await this.prisma.game.create({
				data: {
					roomId: roomId,
					name: name,
					opponent: opponent,
					scoreA: scoreA,
					scoreB: scoreB,
					result: result,
					type: type
				}
			})
		} catch (err) {
			return;
		}
	}
}
