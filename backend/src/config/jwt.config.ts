import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
	accessSecret: process.env.JWT_ACCESS_SECRET,
	refreshSecret: process.env.JWT_REFRESH_SECRET,
	accessExpireTime: process.env.JWT_ACCESS_EXPIRE_TIME, // number 변환값 필요시 parseInt 사용
	refreshExpireTime: process.env.JWT_REFRESH_EXPIRE_TIME
}))