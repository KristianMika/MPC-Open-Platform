import * as elliptic from "elliptic";
import BN from "bn.js";
import * as CryptoJS from "crypto-js";

let ec = new elliptic.ec("p256");
export const verifySchnorrSignature = (
	signature: string,
	plaintext: string,
	pubKeyString: string
) => {
	// Message * G
	var encoder = new TextEncoder();
	var encodedPlain = encoder.encode(plaintext);

	var message_bi = new BN(encodedPlain, 16);

	let message_ec: any = ec.g.mul(message_bi);

	var pubKey = ec.keyFromPublic(pubKeyString, "hex");

	const [s, e] = signature.split(";");
	const eBn = new BN(e, 16);

	// rv = sG+eY
	var Sg = ec.g.mul(s);
	var eY = pubKey.getPublic().mul(eBn);
	var rv = Sg.add(eY);

	// ev = H(m||rv)
	var sha256 = CryptoJS.algo.SHA256.create();
	sha256.update(CryptoJS.enc.Hex.parse(message_ec.encode("hex")));
	sha256.update(CryptoJS.enc.Hex.parse(rv.encode("hex")));
	var ev = sha256.finalize();

	var ev_bn = new BN(ev.toString(CryptoJS.enc.Hex), 16);
	var e_bn = new BN(e, 16);

	// ev = ev mod n
	ev_bn = ev_bn.mod(ec.n as BN);

	return e_bn.cmp(ev_bn) === 0;
};

// var plaintext = '010';
// var s = "bbfa817b3a90bee459688499b875e961595ff1f06b509f8d66a16a06b5f4c98c";
// var e = "00D6967EBE912FBB0039AFDFF7D25118094E9A98F2131C90707BD9136D0C0C8857";
// var pubkey = "042DC4BE8F348B8F27DCCAE32F18B9EFDD58BBC766728B94F7DD493364A7F2DC10E75AF3A5DCE46760B53BBAF2BF3F64DFC44B49189D0E657B5D9C72EA864B431C";
// console.log(`test sig verification is: ${verifySchnorrSignature(plaintext, pubkey, s, e)}`);

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
