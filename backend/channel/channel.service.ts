import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ChatroomDto } from './channel.chatroomdto';
const prisma = new PrismaClient();

@Injectable()
export class ChannelService {

	async createGlobalChatroom(): Promise<ChatroomDto> {
		try{
			let name :string = "all";
			let property :number = 3;
			
			const createdChatroom  = await prisma.channel.create({
				data: {
					name,
					property,
				}
			});
			return createdChatroom;
		} catch (error){
			throw new Error('Faild to create global chatroom: ${error}');
		}
	}
	
	async createChatroom(channel: ChatroomDto): Promise<ChatroomDto>{
		try{
			const createdChatroom = await prisma.channel.create({
				data: channel,
			})
			return createdChatroom;
		} catch (error){
			throw new Error('Faild to create global chatroom: ${error}');
		}
	}
}

  