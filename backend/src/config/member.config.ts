import { registerAs } from "@nestjs/config";

export default registerAs("member", () => ({
	offline: parseInt(process.env.OFFLINE),
	online: parseInt(process.env.ONLINE),
	inGame: parseInt(process.env.INGAME)
}))