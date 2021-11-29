import { Operation } from "../../constants/Constants";

export interface IResponse {
	success: boolean;
	operation: Operation;
	errMessage: string;
	message: string;
	signature: string;
	publicKey: string;
	data: string;
}
