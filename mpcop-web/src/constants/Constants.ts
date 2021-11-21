import { IProtocolButton } from "../store/models/IProtocolButton";

export enum Operation {
	Info = "INFO",
	Keygen = "KEYGEN",
	Reset = "RESET",
	GetPubkey = "GET_PUBKEY",
	Sign = "SIGN",
	Encrypt = "ENCRYPT",
	Decrypt = "DECRYPT",
	Configure = "CONFIGURE",
	GetConfig = "GET_CONFIG",
}

export enum PingOperation {
	Connect = "CONNECT",
	Ping = "PING",
}

export const operationsWithInput = [
	Operation.Sign,
	Operation.Encrypt,
	Operation.Decrypt,
];
export enum Protocol {
	Myst = "myst",
	SmartIdRsa = "smart-id-rsa",
}

export const protocolButtons: IProtocolButton[] = [
	{
		name: Operation.Reset,
		label: "Reset",
		tooltipLabel: "Reset protocol to the initial state.",
	},
	{
		name: Operation.Keygen,
		label: "Generate keys",
		tooltipLabel:
			"Generate keys of all participants and computes the aggregate key.",
	},
	{
		name: Operation.Sign,
		label: "Sign",
		tooltipLabel: "Sign the supplied data.",
	},
	{
		name: Operation.Encrypt,
		label: "Encrypt",
		tooltipLabel: "Encrypt the supplied plaintext.",
	},
	{
		name: Operation.Decrypt,
		label: "Decrypt",
		tooltipLabel: "Decrypt the supplied ciphertext.",
	},
];

export const enum InfoSeverity {
	Error = "error",
	Warning = "warning",
	Info = "info",
	Success = "success",
}

export const COLOR_PRIMARY = "#3f51b5";

export const MOBILE_WIDTH_BREAKPOINT = 800; //pt

export const PROTOCOL_ALERT_VISIBILITY_TIME = 5000; //ms

export const LATENCY_MEASUREMENT_COUNT = 5;

export const pingPerformanceDataCsvHeader = [
	"card count",
	"request network duration",
	"request backend duration",
	"operation duration",
	"response backend duration",
	"response network duration",
];

export const barOptions = {
	scales: {
		xAxes: {
			stacked: true,
			title: {
				display: true,
				text: "Number of participants",
			},
		},
		yAxes: {
			stacked: true,
			title: {
				display: true,
				text: "ms",
			},
		},
	},
};

export const VOWELS = ["a", "e", "i", "o", "u", "y"];
