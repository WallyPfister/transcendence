import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
	accessSecret: process.env.JWT_ACCESS_SECRET,
	refreshSecret: process.env.JWT_REFRESH_SECRET,
	accessExpireTime: process.env.JWT_ACCESS_EXPIRE_TIME,
	refreshExpireTime: process.env.JWT_REFRESH_EXPIRE_TIME,
	limitedSecret: process.env.JWT_LIMITED_SECRET,
	limitedExpireTime: process.env.JWT_LIMITED_EXPIRE_TIME
}))
