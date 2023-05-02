import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MemberConstants } from "./memberConstants";
import { CreateMemberDto } from "./dto/create-member.dto";
import { LoginMemberDTO } from "src/auth/dto/member.login.dto";
import { MemberProfileDto } from "./dto/memberProfile.dto";
import { MemberGameInfoDto } from "./dto/memberGameInfo.dto";
import { MemberGameHistoryDto } from "./dto/memberGameHistory.dto";
import { ChUserProfileDto } from "./dto/chUserProfile.dto";
import { FriendProfileDto } from "./dto/friendProfile.dto";
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
					achieve: 0,
					socket: 0,
					refreshToken: ""
				},
				select: { name: true }
			});
		} catch (err) {
			throw new BadRequestException(`There is a member with the same Intra Id as ${memberInfo.intraId}.`);
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

	async updateRefreshToken(name: string, refreshToken: string): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: { refreshToken: refreshToken }
		});
	}

	async deleteRefreshToken(name: string): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: { refreshToken: "" }
		});
	}

	async generateTfaCode(name: string): Promise<string> {
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

	async getMemberInfo(name: string): Promise<MemberProfileDto> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: {
				name: true,
				email: true,
				avatar: true,
				status: true,
				win: true,
				lose: true,
				level: true,
				score: true,
				achieve: true
			}
		});
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
		}).history({
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
			throw new BadRequestException(`There is no such member with name ${name}.`);
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

	async getChUserInfo(name: string): Promise<ChUserProfileDto> {
		return await this.prisma.member.findUnique({
			where: { name: name },
			select: {
				name: true,
				win: true,
				lose: true,
				level: true,
				score: true
			}
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
			throw new BadRequestException(`There is no such member with name ${friendName}.`);
		}
	}

	async findOneFriend(name: string, friendName: string): Promise<FriendProfileDto[]> {
		try {
			return await this.prisma.member.findUnique({
				where: { name: name },
			}).friend({
				where: { name: friendName },
				select: {
					name: true,
					avatar: true,
					status: true,
					level: true,
					achieve: true
				}
			})
		} catch (err) {
			throw new BadRequestException(`There is no friend with name ${friendName}.`)
		}
	}

	async findAllFriends(name: string): Promise<FriendProfileDto[]> {
		return await this.prisma.member.findUnique({
			where: { name: name },
		}).friend({
			orderBy: { name: 'asc' },
			select: {
				name: true,
				avatar: true,
				status: true,
				level: true,
				achieve: true
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
