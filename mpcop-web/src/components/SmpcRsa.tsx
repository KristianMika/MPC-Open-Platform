import { SMPC_RSA_SERVICE_ADDRESS } from "../constants/Addresses";
import { Operation, Protocol } from "../constants/Constants";
import { verifyRsaSignature } from "../math/signature";
import { IGeneralProtocol } from "../store/models/IGeneralProtocol";
import { useProtocolStyles } from "../styles/protocol";
import { GeneralProtocol } from "./GeneralProtocol";
import { SmpcRsaSetup } from "./SmpcRsaSetup";

/**
 * The Smart-ID RSA component "instantiates" the geneal protocol
 * It provides a graphical interface for Smart-ID RSA administration
 */
export const SmpcRsa: React.FC = () => {
	const { protocol } = useProtocolStyles();
	const protocolProps: IGeneralProtocol = {
		protocol: Protocol.SmartIdRsa,
		protocolDiplayName: "Smart-ID RSA",
		protocolVerticleAddress: SMPC_RSA_SERVICE_ADDRESS,
		verifySignature: verifyRsaSignature,
		verifyDecryption: (_: string, __: string) => false,
		disabledButtons: [Operation.Decrypt],
	};
	return (
		<main className={protocol}>
			<GeneralProtocol {...protocolProps}></GeneralProtocol>
			<SmpcRsaSetup />
		</main>
	);
};
