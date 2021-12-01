import * as elliptic from "elliptic";
import BN from "bn.js";
import * as CryptoJS from "crypto-js";
import NodeRSA from "node-rsa";
import { constants } from "crypto";

const ec = new elliptic.ec("p256");
/**
 * Verifies a schnorr signature
 * @param signature - A schnorr signature to be verified
 * @param plaintext - The plaintext
 * @param pubKeyString - Public key to be used for verification
 * @returns true, if the signature is a valid one, false otherwise
 */
export const verifySchnorrSignature = (
	signature: string,
	plaintext: string,
	pubKeyString: string
) => {
	// Message * G
	const message_bi = new BN(plaintext, "hex");

	const message_ec: any = ec.g.mul(message_bi);

	const pubKey = ec.keyFromPublic(pubKeyString, "hex");

	const [s, e] = signature.split(";");
	const eBn = new BN(e, 16);

	// rv = sG+eY
	const Sg = ec.g.mul(s);
	const eY = pubKey.getPublic().mul(eBn);
	const rv = Sg.add(eY);

	// ev = H(m||rv)
	const sha256 = CryptoJS.algo.SHA256.create();
	sha256.update(CryptoJS.enc.Hex.parse(message_ec.encode("hex")));
	sha256.update(CryptoJS.enc.Hex.parse(rv.encode("hex")));
	const ev = sha256.finalize();

	let ev_bn = new BN(ev.toString(CryptoJS.enc.Hex), 16);
	const e_bn = new BN(e, 16);

	// ev = ev mod n
	ev_bn = ev_bn.mod(ec.n as BN);

	return e_bn.cmp(ev_bn) === 0;
};

/**
 * Verifies a textbook signature RSA signature
 * @param signature - Signature as a hex string
 * @param plaintext - Plaintext as a hex string
 * @param pubKeyString - The public modulus as a hex string
 * @returns true if the verification was successfull, false otherwise
 */
export const verifyRsaSignature = (
	signature: string,
	plaintext: string,
	pubKeyString: string
) => {
	const key = new NodeRSA();

	key.setOptions({
		encryptionScheme: {
			scheme: "pkcs1",
			padding: constants.RSA_NO_PADDING,
		},
	});

	key.importKey(
		{
			n: Buffer.from(pubKeyString, "hex"),
			e: 65537,
		},
		"components-public"
	);

	const verif = key.encrypt(Buffer.from(signature, "hex"));

	const verifWithoutPadding = verif.slice(
		verif.length - Buffer.from(plaintext, "hex").length,
		verif.length
	);

	return Buffer.from(plaintext, "hex").compare(verifWithoutPadding) == 0;
};
