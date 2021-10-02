import { Protocol } from "../../constants/Constants";

export interface IGeneralProtocol {
	protocol: Protocol;
	verifySignature: (
		signature: string,
		plaintext: string,
		pubKey: string
	) => boolean;
	verifyDecryption: (
		decryptedPlaintext: string,
		originalPlaintext: string
	) => boolean;
}
