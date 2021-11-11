export interface IResponse {
	success: boolean;
	operation: string;
	errMessage: string;
	message: string;
	signature: string;
	publicKey: string;
	data: string;
}
