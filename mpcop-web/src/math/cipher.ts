import * as elliptic from "elliptic";
const ec = new elliptic.ec("p256");
export const verifyMystCipher = (
	decryptedCiphertext: string,
	plaintext: string
): boolean => {
	const mG = ec.g.mul(plaintext);
	const decryptedEc = ec
		.keyFromPublic(decryptedCiphertext, "hex")
		.getPublic();
	const wasVeirificationSuccessfull: boolean = mG.eq(decryptedEc);

	return wasVeirificationSuccessfull;
};

