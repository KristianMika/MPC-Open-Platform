import * as elliptic from "elliptic";
const ec = new elliptic.ec("p256");
export const verifyMystCipher = (
	decryptedCiphertext: string,
	plaintext: string
): boolean => {
	const mG = ec.g.mul(plaintext);
	const decryptedEc: any = ec
		.keyFromPublic(decryptedCiphertext, "hex")
		.getPublic();
	console.log(mG.encode("hex"));
	console.log(decryptedEc.encode("hex"));
	const wasVeirificationSuccessfull: boolean = mG.eq(decryptedEc);
	if (wasVeirificationSuccessfull) {
		alert(
			"DEBUG: The plaintext has been compared to the recently encrypted plaintext and they match"
		);
	}
	return wasVeirificationSuccessfull;
};

//TODO: missing implementation
export const verifyRsaCipher = (
	decryptedCiphertext: string,
	plaintext: string
): boolean => {
	return true;
};
