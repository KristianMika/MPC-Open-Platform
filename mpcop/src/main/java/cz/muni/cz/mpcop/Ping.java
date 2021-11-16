package cz.muni.cz.mpcop;

import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.CardChannel;
import javax.smartcardio.CardException;
import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

import static cz.muni.cz.mpcop.JavacardUtils.checkSw;

public class Ping implements Runnable {
    public static final byte NONE = 0x00;
    private final static byte INS_PING = (byte) 0x12;
    private static final byte CLA_PING = (byte) 0x88;
    public volatile Optional<String> lastError = Optional.empty();

    private final CardChannel channel;

    public Ping(CardChannel channel) {
        this.channel = channel;
    }

    public void ping() throws CardException, GeneralMPCOPException {

        ResponseAPDU response = channel.transmit(new CommandAPDU(CLA_PING, INS_PING, NONE, NONE));
        checkSw(response);
        byte[] data = response.getData();
        String dataString = new String(Arrays.copyOfRange(data, 0, 4));
        if (!Objects.equals(dataString, "pong")) {
            throw new GeneralMPCOPException("Did not return pong");
        }

    }

    @Override
    public void run() {
        try {
            this.ping();
            // Thread.sleep(1000);
        } catch (Exception e) {
            this.lastError = Optional.ofNullable(e.getMessage());
        }
    }
}
