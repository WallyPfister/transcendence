export interface ChatRoomListDTO {
	  roomId: string;
	  roomName: string;
	  chiefId: string | null;
	  banList: string[];
	  muteList: string[];
}