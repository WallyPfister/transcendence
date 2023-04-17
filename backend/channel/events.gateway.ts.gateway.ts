import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(3001, {transports: ['websocket']})
export class EventsGateway {
	@WebSocketServer()
	server: Server;

	@SubscribeMessage('ClientToServer')
	async handleMessage(@MessageBody() data){
		this.server.emit('ServerTocClient', data);
	}
}
