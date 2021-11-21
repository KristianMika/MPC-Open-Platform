import * as utils from "../utils/utils";

describe("Utility function", () => {
	describe("getDateTimestamp()", () => {
		it("should return a valid timestamp", () => {
			const timestamp = utils.getDateTimestamp();
			const matchDateTimestampRegex = new RegExp(
				"^(\\d\\d_){2}\\d\\d\\d\\d_(\\d\\d_){2}\\d\\d$"
			);
			expect(timestamp).toMatch(matchDateTimestampRegex);
		});

		describe("verifyHexString()", () => {
			it("should distinguish a valid from invalid hex strings", () => {
				expect(utils.verifyHexString("123")).toBeFalsy();
				expect(utils.verifyHexString("01")).toBeTruthy();
			});
		});

		describe("getIndefiniteArticle()", () => {
			it("should choose the correct indefinite article", () => {
				expect(utils.getIndefiniteArticle("apple")).toEqual("an");
				expect(utils.getIndefiniteArticle("banana")).toEqual("a");
			});
		});

		describe("computeAverage()", () => {
			it("should compute average", () => {
				expect(utils.computeAverage([1, 2, 3])).toEqual(2);
			});
		});

		describe("range()", () => {
			it("should generate the valid range", () => {
				expect(utils.range(5)).toEqual([1, 2, 3, 4, 5]);
			});
		});

		describe("replicate()", () => {
			it("should replicate an element", () => {
				expect(utils.replicate(35, 3)).toEqual([35, 35, 35]);
			});
		});
		describe("appendDurationStr()", () => {
			it("should append duration to a message", () => {
				expect(utils.appendDurationStr("Test succeeded", 23)).toEqual(
					"Test succeeded (23 ms)"
				);
			});
		});

		describe("addVectors", () => {
			it("should add two vectors", () => {
				expect(utils.addVectors([1, 2, 3], [4, 5, 0])).toEqual([
					5, 7, 3,
				]);
			});
		});

		describe("divideVector()", () => {
			it("should divide vectors", () => {
				expect(utils.divideVector([5, 10, 100], 5)).toEqual([1, 2, 20]);
			});
		});
	});
});
