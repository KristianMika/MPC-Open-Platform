import { VOWELS } from "../constants/Constants";
import { OperationResult } from "../constants/Operation";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { IProcessedMultiPingMeasurement } from "../store/models/IProcessedMultiPingMeasurement";
import { IResponse } from "../store/models/IResponse";

/**
 * Returns the currect time in format hh:mm:ss
 * @returns the currect time in format hh:mm:ss
 */
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

/**
 * Creates a current date timestamp in format dd_mm_yyyy_hh_mm_ss.
 * @returns a current date timestamp in format dd_mm_yyyy_hh_mm_ss
 */
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

/**
 * Prints a number to 2 places
 * @param num - The number to be rounded
 * @returns rounded number
 */
const toTwoPlaces = (num: number): string => {
	return num.toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false,
	});
};

/**
 * Creates of log entry of the specified format:
 * [✓|x|i] hh:mm:ss - protocol: msg
 * @param res - Operation result
 * @param msg - The message to be logged
 * @param protocol - Protocol
 * @returns a formatted log entry
 */
export const formatLog = (
	res: OperationResult = OperationResult.Info,
	msg: string,
	protocol = "MPCOP"
): string => `[${res}] ${getTime()} - ${protocol}: ${msg}`;

/**
 * Checks if the request has been successfull
 * @param body - The request body
 * @returns the operation success
 */
export const checkResponseStatus = (body: IResponse): boolean => {
	return body.success;
};

/**
 * Creates a timeout promise
 * @param delay - Timeout duration
 * @returns Timeout promise
 */
export const timeout = (delay: number): Promise<NodeJS.Timeout> => {
	return new Promise((res) => setTimeout(res, delay));
};

/**
 * Verifies the input string is indeed a hex encoded string
 * @param hex - The hex string to be verified
 * @returns true, iff the hex string is valid
 */
export const verifyHexString = (hex: string): boolean => {
	return (
		typeof hex === "string" &&
		hex.length % 2 === 0 &&
		!isNaN(Number("0x" + hex))
	);
};

/**
 * Based on the input word, return the corresponding article
 *
 * @param word - The word that serves for article choice
 * @returns The correct indefinite article a/an
 */
export const getIndefiniteArticle = (word: string): string => {
	return VOWELS.includes(word.toLowerCase()[0]) ? "an" : "a";
};

/**
 * From an operation creates an alert message informing that the request has been sent
 * @param operation - The operation to be used in alert
 * @returns Composed allert message
 */
export const composeRequestInfoAlert = (operation: string): string => {
	const article = getIndefiniteArticle(operation);
	return `Sending ${article} "${operation}" request to the server...`;
};

/**
 * Computes average of an array
 * @param nums - An array of values
 * @returns computed average
 */
export const computeAverage = (nums: Array<number>): number => {
	const sum = nums.reduce((a: number, b: number) => a + b, 0);
	return sum / nums.length || 0;
};

/**
 * Generates an array = [1, 2, ..., n]`
 * @param n - The length of the array
 * @returns an array of natural numbers from 1 to `n`
 */
export const range = (n: number): number[] =>
	Array.apply(0, Array(n)).map((_, b: number) => {
		return b + 1;
	});

/**
 * Creates a vector of elements `elem` of length `count`
 *
 * @param elem - The element to be replicated
 * @param count - The length of the final array
 * @returns An array of `count` `elem`
 */
export const replicate = <T>(elem: T, count: number): T[] =>
	Array(count).fill(elem);

/**
 * Appends the operation duration to the input string
 * Example: Operation was successfull -> Operation was successfull (27 ms)
 *
 * @param message - The input message
 * @param duration - Operation duration in ms
 * @returns The message with the appended duration
 */
export const appendDurationStr = (message: string, duration: number): string =>
	`${message} (${duration} ms)`;

/**
 * Appends the operation duration to the input string, iff the performanceMeasurement is not undefined
 * Example: Operation was successfull -> Operation was successfull (27 ms)
 *
 * @param message - The input message
 * @param performanceMeasurement - The source of the duration
 * @returns The message with the appended duration
 */
export const appendDuration = (
	resultMessage: string,
	performanceMeasurement: PerformanceMeasurement | undefined
): string => {
	if (performanceMeasurement) {
		return appendDurationStr(
			resultMessage,
			performanceMeasurement.computeBackendOperationDuration()
		);
	}
	return resultMessage;
};

/**
 * Sums two vectors of the same length using vector addition: [1, 2] + [0, 1] = [1, 3]
 * @param a - Vector a
 * @param b - Vector b
 * @returns a + b
 */
export const addVectors = (a: number[], b: number[]): number[] => {
	const out: number[] = [];
	for (let i = 0; i < a.length; i++) {
		out.push(a[i] + b[i]);
	}
	return out;
};

/**
 * Sums two processed multiPing measurement instances
 * @param a - Instance a
 * @param b - Instance b
 * @returns a + b
 */
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

/**
 * Divides a vector by a scalar: [7, 42] / 7 = [1, 6]
 * @param divident - Vector to be divided
 * @param divisor - Scalar to be used for division
 * @returns a / b
 */
export const divideVector = (divident: number[], divisor: number): number[] => {
	const out: number[] = [];
	for (let i = 0; i < divident.length; i++) {
		out.push(divident[i] / divisor);
	}
	return out;
};

/**
 * Divides a processed multi ping measurement by a scalar
 * @param divident - The measurement to be divided
 * @param divisor - The number
 * @returns
 */
export const divide = (
	divident: IProcessedMultiPingMeasurement,
	divisor: number
): IProcessedMultiPingMeasurement => {
	return {
		requestNetwork: divident.requestNetwork / divisor,
		requestBackend: divident.requestBackend / divisor,
		javaCardTimes: divideVector(divident.javaCardTimes, divisor),
		responseBackend: divident.responseBackend / divisor,
		responseNetwork: divident.responseNetwork / divisor,
	};
};

/**
 * Joins debug messages using the new-line character into a single string 
 * @param messages 
 * @returns 
 */
export const joinDebugMessages = (messages: string[]):string => messages.join("\n");
