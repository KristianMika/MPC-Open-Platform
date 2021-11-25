import { verifySchnorrSignature } from "../math/signature";

describe("Signature verification", () => {
	describe("verifySchnorrSignature() function", () => {
		const plaintext = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";
		const validSignature =
			"ec39843770ac3ecd24a41b7bbb14c65953dd1a182b723073ee74e024bc42d9c9;5A093F2B2CB8E9DD6202E8B178E0ACA5AA4E6DF4EFB9DEA62CAB5DDC12E53DC6";
		const invalidSignature =
			"5fcd7814cddfbadf55f934e6e7fa5d12dd2b8418de8bb20705969d5e1b9baab0;0DD33307E556E1B8C6C09797830B2F985665666EB9C7D89662C2A2D393DD3B64";
		const pubkey =
			"041B39D97AF794C27BC0543A29EAED4F88AE08BBC8AD0A374DCC81B95893805D9D7CFFD53213FABBAEDB28CA569789B9C8CB4E8B6FA549A8945C791D1AC837475D";

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
