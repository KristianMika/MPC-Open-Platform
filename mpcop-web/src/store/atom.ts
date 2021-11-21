import { atom } from "recoil";
import { IDebugMessages } from "./models/IDebugMessages";
import { ISocketState } from "./models/ISocketState";
import { ILatency } from "./models/ILatency";

/**
 * Contains debug messages logged by protocols and protocol setups
 */
export const debugMessagesState = atom<IDebugMessages>({
	key: "debugMessages",
	default: {
		messages: [],
	},
});

/**
 * Contains the socket open status
 */
export const eventbusSocketState = atom<ISocketState>({
	key: "socketState",
	default: { isOpen: false },
});

/**
 * Holds the last `n` latency measurements
 */
export const latencyState = atom<ILatency>({
	key: "latency",
	default: {
		latencies: [],
	},
});
