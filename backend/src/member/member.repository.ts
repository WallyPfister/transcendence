import { Injectable } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { MemberProfileDto } from "./dto/memberProfile.dto";
import { FriendProfile } from "./dto/friendProfile.dto";

@Injectable()
export class MemberRepository {
	constructor(private prisma: PrismaService) {} 

	async createMember(memberInfo: CreateMemberDto): Promise<any> {
		return await this.prisma.member.create({
			data: {
				...memberInfo,
				status: 0,
				win: 0,
				lose: 0,
				level: 0,
				score: 0,
				achieve: 0,
				socket: 0,
				refreshToken: ""
			},
			select: {
				name: true,
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
				achieve: true,
			}
		});
	}

	async findOneByIntraId(intraId: string): Promise<LoginMemberDTO> {
		return this.prisma.member.findUnique({
			where: { intraId: intraId },
			select: { 
				name: true,
				twoFactor: true
			}
		});
	}

	async updateStatus(name: string, status: number): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: { status: status }
		});
	}

	async updateGameScore(name: string, win: number, lose: number, score: number, level: number): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: {
				win: win,
				lose: lose,
				score: score,
				level: level,
			}
		});
	}

	async updateAchieve(name: string, achieve: number): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: { achieve: achieve }
		});
	}

	async deleteMember(name: string): Promise<void> {
		await this.prisma.member.delete({
			where: {
				name: name
			}
		});
	}

	async addFriend(name: string, friendName: string): Promise<void> {
		await this.prisma.member.update({
			where: { name: name },
			data: {
				friend: {
					connect: { name: friendName }
				}
			}
		});
	}

	async findOneFriend(name: string, friendName: string): Promise<FriendProfile[]> {
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
	}

	async findAllFriends(name: string): Promise<any> {
		console.log(`hello`);
		return this.prisma.member.findUnique({
			where: { name: name },
			select: {
				friend: {
					orderBy: {
						name: 'asc',
					},
					select: {
						name: true,
						avatar: true,
						status: true,
						level: true,
						achieve: true
					}
				},
			},
		}).friend;
	}

	async deleteFriend(name: string, friendName: string): Promise<void> {
		await this.prisma.member.update({
			where: { 
				name: name
			},
			data: { 
				friend: {
					disconnect: { 
						name: friendName
					} 
				} 
			},
		});
	}
}
