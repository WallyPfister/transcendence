import { registerAs } from "@nestjs/config";

export default registerAs("tfa", () => ({
	tfaSendUrl: process.env.TFA_SEND_URL,
	tfaVerifyUrl: process.env.TFA_VERIFY_URL,
	tfaExpireTime: process.env.TFA_EXPIRE_TIME,
	mailerName: process.env.MAILER_NAME,
	mailerPass: process.env.MAILER_PASS,
}))
