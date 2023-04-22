export interface JwtTokenInfo {
	accessToken: string;
	refreshToken: string;
	expiresIn: number; // seconds
}

export interface JwtAccessTokenInfo {
	accessToken: string;
	expiresIn: number; // seconds
}
