import * as elliptic from "elliptic";
import BN from "bn.js";
import * as CryptoJS from "crypto-js";

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
	const message_bi = new BN(plaintext, 'hex');

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

// TODO: missing implementation
export const verifyRsaSignature = (
	signature: string,
	plaintext: string,
	pubKeyString: string
) => {
	// alert("bout to initialise")
	// const m = new BN(plaintext, 16)
	// const n = new BN(publicModulus, 16)
	// const e = new BN(65537, 10)
	// const s = new BN(signature, 16)
	// alert("has been initialised")
	// return s.pow(e).mod(n).cmp(m) === 0

	//TODO: https://www.npmjs.com/package/jsrsasign

	return true;
};
