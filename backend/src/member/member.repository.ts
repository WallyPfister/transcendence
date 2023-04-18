import { PrismaService } from "src/prisma/prisma.service";
import { CreateMemberDto } from "./dto/create-member.dto/create-member.dto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MemberRepository {
	// constructor(private prisma: PrismaService) {}
	async createMember(memberInfo: CreateMemberDto) {
		return await prisma.member.create({
			data: {
				...memberInfo,
				status: 0,
				win: 0,
				lose: 0,
				level: 0,
				score: 0,
				achieve: 0,
				socket: 0,
			}
		});
	}

	findOneByIntraId(intraId: string) { // 친구의 닉네임이 변경될 때 내 디비 친구 컬럼에서도 변경이 되나?
		return prisma.member.findFirst({where: {intraId}});
	}

	async addFriend(ownerIntra: string, friendIntra: string) {
		return await prisma.member.update( { 
			where: {
				intraId: ownerIntra
			}, data: {
				friend: {
					connect: {
						intraId: friendIntra
					}
				}
			}
		})
	}

	findOneFriend(ownerIntra: string, friendIntra: string) {
		return prisma.member.findUnique({
			where: {
				intraId: ownerIntra 
			}
		}).friend({
			where: {
				intraId: friendIntra
			}
		})
	}

	findAllFriend(ownerIntra: string) {
		return prisma.member.findUnique({
			where: {
				intraId: ownerIntra
			}
		}).friend // 이렇게 했을 때 전체가 반환이 되는지?
	}

	hasFriend(ownerIntra: string) {
		return prisma.member.findUnique({
			where: {
				name: ownerIntra
			}
		}).friend // 뭔가 참 거짓으로 못하나 여기에 값있는지 없는지 정도..?
	}
}
