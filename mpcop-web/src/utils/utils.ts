const getTime = () => {
	let currentDate = new Date();
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
	protocol: string = "MPCOP"
) => `[${res}] ${getTime()} - ${protocol}: ${msg}`;

export const checkResponseStatus = (body: any) => {
	return body.success === true;
};
export const timeout = (delay: number) => {
	return new Promise((res) => setTimeout(res, delay));
};

export const verifyHexString = (hex: string) => {
	return (
		typeof hex === "string" &&
		hex.length % 2 === 0 &&
		!isNaN(Number("0x" + hex))
	);
};

export const capitalize = (str: string): string => {
	let result: string = "";
	if (str.length > 0) {
		result = str.charAt(0).toUpperCase();
	}
	if (str.length > 1) {
		result += str.slice(1);
	}
	return result;
};