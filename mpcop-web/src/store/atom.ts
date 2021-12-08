import { atom } from "recoil";
import { IDebugMessages } from "./models/IDebugMessages";
import { ISocketState } from "./models/ISocketState";
import { ILatency } from "./models/ILatency";
import { Protocol } from "../constants/Constants";
import { ISmpcRsaFormValues } from "./models/ISmpcRsaFormValues";
import {
	ISmpcRsaDefaultFormValues,
	mystFormDefaultValues,
} from "../constants/DefaultValues";
import { IMystFormValues } from "./models/IMystFormValues";

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

/**
 * Holds public keys of all protocols in a map
 */
export const protocolPubKeyState = atom<Map<string, string>>({
	key: "pubkey",
	default: new Map([
		[Protocol.Myst, " "],
		[Protocol.SmartIdRsa, " "],
	]),
});

/**
 * Holds Smart-id rsa config values
 */
export const smpcRsaConfigState = atom<ISmpcRsaFormValues>({
	key: "smpcrsaConfig",
	default: ISmpcRsaDefaultFormValues,
});

/**
 * Holds Myst config values
 */
export const mystConfigState = atom<IMystFormValues>({
	key: "mystConfig",
	default: mystFormDefaultValues,
});
