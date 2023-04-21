import { Controller , Get, Logger } from '@nestjs/common';
import { ChannelService } from './channel.service'
import { get } from 'http';
import { Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { io } from 'socket.io-client';

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}
	
	// @Get('global')
	// async create(): Promise<> {
	// 	return this.channelService.createGlobalChatroom();
	// }

	// @Post('general')
	// async createGeneral(@Body() channel: ChatroomDto): Promise<ChatroomDto> {
	// 	return this.channelService.createChatroom(channel);
	// }
}
