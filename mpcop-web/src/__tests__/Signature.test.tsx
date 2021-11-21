import { verifySchnorrSignature } from "../math/signature";

describe("Signature verification", () => {
	describe("verifySchnorrSignature() function", () => {
		const plaintext = "010";
		const validSignature =
			"bbfa817b3a90bee459688499b875e961595ff1f06b509f8d66a16a06b5f4c98c;00D6967EBE912FBB0039AFDFF7D25118094E9A98F2131C90707BD9136D0C0C8857";
		const invalidSignature =
			"f26437c098b44ad7ead844dd795ad428d7ab0857bb92797d230d3c07c2010802;0D62824B29069B6A1E5FFAEDD00544FEB49E50F9D00A168BD81EBA5003EB168C";
		const pubkey =
			"042DC4BE8F348B8F27DCCAE32F18B9EFDD58BBC766728B94F7DD493364A7F2DC10E75AF3A5DCE46760B53BBAF2BF3F64DFC44B49189D0E657B5D9C72EA864B431C";

		it("Should detect a valid signature", () => {
			expect(
				verifySchnorrSignature(validSignature, plaintext, pubkey)
			).toBeTruthy();
		});

		it("Should detect an invalid signature", () => {
			expect(
				verifySchnorrSignature(invalidSignature, plaintext, pubkey)
			).toBeFalsy();
		});
	});
});
