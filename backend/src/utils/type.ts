export interface JwtTokenInfo {
	accessToken: string;
	refreshToken: string;
	expiresIn: number; // seconds
	tfa: boolean;
}
