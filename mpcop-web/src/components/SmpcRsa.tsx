import { SMPC_RSA_SERVICE_ADDRESS } from "../constants/Addresses";
import { Protocol } from "../constants/Constants";
import { verifyRsaCipher } from "../math/cipher";
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
		verifyDecryption: verifyRsaCipher,
	};
	return (
		<main className={protocol}>
			<GeneralProtocol {...protocolProps}></GeneralProtocol>
			<SmpcRsaSetup />
		</main>
	);
};
