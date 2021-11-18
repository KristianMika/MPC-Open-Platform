import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { IProcessedMultiPingMeasurement } from "../store/models/IProcessedMultiPingMeasurement";
import { IResponse } from "../store/models/IResponse";

const VOWELS = ["a", "e", "i", "o", "u", "y"];

const getTime = (): string => {
	const currentDate = new Date();
	return (
		toTwoPlaces(currentDate.getHours()) +
		":" +
		toTwoPlaces(currentDate.getMinutes()) +
		":" +
		toTwoPlaces(currentDate.getSeconds())
	);
};

export const getDateTimestamp = (): string => {
	const currentDate = new Date();
	return (
		currentDate.getDate().toString() +
		"_" +
		currentDate.getMonth().toString() +
		"_" +
		currentDate.getFullYear().toString() +
		"_" +
		toTwoPlaces(currentDate.getHours()) +
		"_" +
		toTwoPlaces(currentDate.getMinutes()) +
		"_" +
		toTwoPlaces(currentDate.getSeconds())
	);
};

const toTwoPlaces = (num: number): string => {
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
): string => `[${res}] ${getTime()} - ${protocol}: ${msg}`;

export const checkResponseStatus = (body: IResponse): boolean => {
	return body.success;
};
export const timeout = (delay: number): Promise<NodeJS.Timeout> => {
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

export const computeAverage = (nums: Array<number>): number => {
	const sum = nums.reduce((a: number, b: number) => a + b, 0);
	return sum / nums.length || 0;
};

export const range = (n: number): number[] =>
	Array.apply(0, Array(n)).map((_, b: number) => {
		return b + 1;
	});

export const replicate = <T>(elem: T, count: number): T[] =>
	Array(count).fill(elem);

export const appendDuration = (
	resultMessage: string,
	performanceMeasurement: PerformanceMeasurement | undefined
): string => {
	if (performanceMeasurement) {
		return `${resultMessage} (${performanceMeasurement.computeBackendOperationDuration()}ms)`;
	}
	return resultMessage;
};

export const appendDurationStr = (
	resultMessage: string,
	duration: number
): string => `${resultMessage} (${duration}ms)`;

export const addVectors = (a: number[], b: number[]): number[] => {
	const out: number[] = [];
	for (let i = 0; i < a.length; i++) {
		out.push(a[i] + b[i]);
	}
	return out;
};

export const add = (
	a: IProcessedMultiPingMeasurement,
	b: IProcessedMultiPingMeasurement
): IProcessedMultiPingMeasurement => {
	return {
		requestNetwork: a.requestNetwork + b.requestNetwork,
		requestBackend: a.requestBackend + b.requestBackend,
		javaCardTimes: addVectors(a.javaCardTimes, b.javaCardTimes),
		responseBackend: a.responseBackend + b.responseBackend,
		responseNetwork: a.responseNetwork + b.responseNetwork,
	};
};

export const divideVector = (a: number[], num: number): number[] => {
	const out: number[] = [];
	for (let i = 0; i < a.length; i++) {
		out.push(a[i] / num);
	}
	return out;
};
export const divide = (
	a: IProcessedMultiPingMeasurement,
	num: number
): IProcessedMultiPingMeasurement => {
	return {
		requestNetwork: a.requestNetwork / num,
		requestBackend: a.requestBackend / num,
		javaCardTimes: divideVector(a.javaCardTimes, num),
		responseBackend: a.responseBackend / num,
		responseNetwork: a.responseNetwork / num,
	};
};
