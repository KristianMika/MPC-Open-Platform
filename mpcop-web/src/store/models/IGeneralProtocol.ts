import { Protocol } from "../../constants/Constants";

export interface IGeneralProtocol {
	protocol: Protocol;
	protocolDiplayName: String;
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
