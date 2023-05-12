export interface ChatRoomListDto {
	roomId: string;
	roomName: string;
	chiefId: string | null;
	adminList: string[];
	banList: string[];
	muteList: Record<string, Date>;
	password: string | null;
}

export interface userDto {
	roomId: string,
	nickname: string,
	socketId: string,
	isAdmin: boolean,
	isChief: boolean
}