export interface ChatRoomListDTO {
	roomId: string;
	roomName: string;
	chiefId: string | null;
	adminList: string[];
	banList: string[];
	muteList: Record<string, Date>;
	password: string | null;
}