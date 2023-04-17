import { Controller , Get } from '@nestjs/common';
import { ChannelService } from './channel.service'
import { ChatroomDto } from './channel.chatroomdto';
import { get } from 'http';
import { Post } from '@nestjs/common';
import { Body } from '@nestjs/common';

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}
	
	@Get('global')
	async create(): Promise<ChatroomDto> {
		return this.channelService.createGlobalChatroom();
	}

	@Post('general')
	async createGeneral(@Body() channel: ChatroomDto): Promise<ChatroomDto> {
		return this.channelService.createChatroom(channel);
	}
}
