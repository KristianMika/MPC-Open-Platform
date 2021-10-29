const VOWELS = ["a", "e", "i", "o", "u", "y"];

const getTime = () => {
	const currentDate = new Date();
	return (
		toTwoPlaces(currentDate.getHours()) +
		":" +
		toTwoPlaces(currentDate.getMinutes()) +
		":" +
		toTwoPlaces(currentDate.getSeconds())
	);
};

const toTwoPlaces = (num: number) => {
	return num.toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false,
	});
};

export enum OperationResult {
	Success = "✓",
	Error = "✗",
	Info = "i",
}
export const formatLog = (
	res: OperationResult = OperationResult.Info,
	msg: string,
	protocol = "MPCOP"
) => `[${res}] ${getTime()} - ${protocol}: ${msg}`;

export const checkResponseStatus = (body: any): boolean => {
	return body.success;
};
export const timeout = (delay: number) => {
	return new Promise((res) => setTimeout(res, delay));
};

export const verifyHexString = (hex: string): boolean => {
	return (
		typeof hex === "string" &&
		hex.length % 2 === 0 &&
		!isNaN(Number("0x" + hex))
	);
};

export const capitalize = (str: string): string => {
	let result = "";
	if (str.length > 0) {
		result = str.charAt(0).toUpperCase();
	}
	if (str.length > 1) {
		result += str.slice(1);
	}
	return result;
};

const getIndefiniteArticle = (noun: string): string => {
	return VOWELS.includes(noun.toLowerCase()[0]) ? "an" : "a";
};

export const composeRequestInfoAlert = (operation: string): string => {
	const article = getIndefiniteArticle(operation);
	return `Sending ${article} "${operation}" request to the server...`;
};
