import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { MemberConstants } from "./memberConstants";
import { CreateMemberDto } from "./dto/create-member.dto";
import { LoginMemberDTO } from "src/auth/dto/member.login.dto";
import { MemberGameInfoDto } from "./dto/memberGameInfo.dto";
import { MemberGameHistoryDto } from "./dto/memberGameHistory.dto";
import { memberProfileDto } from "./dto/memberProfile.dto";
import { customAlphabet } from "nanoid";

@Injectable()
export class MemberRepository {
	constructor(private prisma: PrismaService) { }

	async createMember(memberInfo: CreateMemberDto): Promise<any> {
		try {
			return await this.prisma.member.create({
				data: {
					...memberInfo,
					status: MemberConstants.OFFLINE,
					win: 0,
					lose: 0,
					level: 0,
					score: 0,
					achieve: 0
				},
			});
		} catch (err) {
			if (err.code === "P2002")
				throw new ConflictException(`There is a member with the same Intra Id as ${memberInfo.intraId}.`);
			throw err; // 확인 필요
		}
	}

	async checkDuplicateName(name: string): Promise<{ name: string }> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: { name: true }
		});
	}

	async findOneByIntraId(intraId: string): Promise<LoginMemberDTO> {
		return this.prisma.member.findUnique({
			where: { intraId: intraId },
			select: {
				name: true,
				email: true,
				twoFactor: true
			}
		});
	}

	generateTfaCodeForSignUp(): string {
		const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const code = customAlphabet(charset, 6)();
		return code;
	}

	async generateTfaCodeForSignIn(name: string): Promise<string> {
		const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const code = customAlphabet(charset, 6)();
		await this.prisma.member.update({
			where: { name: name },
			data: {
				tfaCode: code,
				tfaTime: new Date()
			}
		});
		return code;
	}

	async getTfaCode(name: string): Promise<{ tfaCode: string }> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: { tfaCode: true }
		});
	}

	async getTfaTime(name: string): Promise<{ tfaTime: Date }> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: { tfaTime: true }
		});
	}

	async getMemberInfo(name: string): Promise<memberProfileDto> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: {
				name: true,
				avatar: true,
				email: true,
				status: true,
				win: true,
				lose: true,
				level: true,
				score: true,
				achieve: true
			}
		})
	}

	async updateStatus(name: string, status: number): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: { status: status }
		});
	}

	async getStatus(name: string): Promise<{ status: number }> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: { status: true }
		});
	}

	async updateGameResult(member: MemberGameInfoDto): Promise<void> {
		await this.prisma.member.update({
			where: { name: member.name },
			data: {
				win: member.win,
				lose: member.lose,
				score: member.score,
				level: member.level,
				achieve: member.achieve
			}
		});
	}

	async getGameInfo(name: string): Promise<MemberGameInfoDto> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: {
				name: true,
				win: true,
				lose: true,
				score: true,
				level: true,
				achieve: true
			}
		})
	}

	async getMemberHistory(name: string): Promise<MemberGameHistoryDto[]> {
		return await this.prisma.member.findUnique({
			where: { name: name }
		}).game({
			where: { name: name },
			orderBy: { date: 'asc' },
			select: {
				name: true,
				opponent: true,
				scoreA: true,
				scoreB: true,
				result: true,
				type: true,
				date: true
			}
		});
	}

	async getRankingInfo(): Promise<MemberGameInfoDto[]> {
		return await this.prisma.member.findMany({
			orderBy: [
				{ level: 'desc' },
				{ name: 'asc' }
			],
			select: {
				name: true,
				win: true,
				lose: true,
				level: true,
				score: true,
				achieve: true
			}
		})
	}

	async deleteMember(name: string): Promise<void> {
		try {
			await this.prisma.member.delete({
				where: { name: name }
			});
		} catch (err) {
			throw new NotFoundException(`There is no such member with name ${name}.`);
		}
	}

	async isFriend(name: string, checkMember: string): Promise<any> {
		return await this.prisma.member.findUnique({
			where: { name: name },
		}).friend({
			where: { name: checkMember },
			select: { name: true }
		})
	}

	async addFriend(name: string, friendName: string): Promise<void> {
		try {
			await this.prisma.member.update({
				where: { name: name },
				data: {
					friend: {
						connect: { name: friendName }
					}
				}
			});
		} catch (err) {
			throw new NotFoundException(`There is no such member with name ${friendName}.`);
		}
	}

	async findAllFriends(name: string): Promise<{name: string}[]> {
		return await this.prisma.member.findUnique({
			where: { name: name },
		}).friend({
			orderBy: { name: 'asc' },
			select: {
				name: true
			}
		});
	}

	async deleteFriend(name: string, friendName: string): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: {
				friend: {
					disconnect: { name: friendName }
				}
			}
		});
	}
}
