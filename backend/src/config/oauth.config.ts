import { registerAs } from "@nestjs/config";

export default registerAs("oauth", () => ({
	clientId: process.env.FT_OAUTH_CLIENT_ID,
	secret: process.env.FT_OAUTH_SECRET,
	callBack: process.env.FT_OAUTH_CALLBACK,
	url: process.env.FT_OAUTH_URL,
	tokenUrl: process.env.FT_OAUTH_TOKEN_URL,
	me: process.env.FT_API_ME
}))