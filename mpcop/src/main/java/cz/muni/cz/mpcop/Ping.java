package cz.muni.cz.mpcop;

import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.CardChannel;
import javax.smartcardio.CardException;
import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

import static cz.muni.cz.mpcop.JavaCardUtils.checkSw;

/**
 * The class {@link Ping} represents a Ping participant - Host part of the Ping performance test
 *
 * @author Kristian Mika
 */
public class Ping implements Runnable {
    public static final byte NONE = 0x00;
    private final static byte INS_PING = (byte) 0x12;
    private static final byte CLA_PING = (byte) 0x88;
    private final CardChannel channel;
    public volatile Optional<String> lastError = Optional.empty();

    public Ping(CardChannel channel) {
        this.channel = channel;
    }

    /**
     * @throws CardException         - If the cards responses with an error
     * @throws GeneralMPCOPException - If the card does not return a correct APDU packet
     */
    public void ping() throws CardException, GeneralMPCOPException {
        ResponseAPDU response = channel.transmit(new CommandAPDU(CLA_PING, INS_PING, NONE, NONE));
        checkSw(response);
        byte[] data = response.getData();
        String dataString = new String(Arrays.copyOfRange(data, 0, 4));
        if (!Objects.equals(dataString, "pong")) {
            throw new GeneralMPCOPException("The card did not return 'pong'");
        }

    }

    @Override
    public void run() {
        try {
            this.ping();
        } catch (Exception e) {
            this.lastError = Optional.ofNullable(e.getMessage());
        }
    }
}
