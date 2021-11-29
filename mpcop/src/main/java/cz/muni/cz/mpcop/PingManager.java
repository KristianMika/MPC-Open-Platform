package cz.muni.cz.mpcop;

import cz.muni.cz.mpcop.cardTools.CardManager;
import cz.muni.cz.mpcop.cardTools.Util;
import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.CardChannel;
import javax.smartcardio.TerminalFactory;
import java.util.ArrayList;
import java.util.Optional;

/**
 * The {@link PingManager} orchestrates all {@link Ping} participants
 * @author Kristian Mika
 */
public class PingManager {
    private final static String appletID = "01ffff0405060708090102";

    public ArrayList<CardChannel> cardsList;
    public ArrayList<Ping> pingPlayers;


    public PingManager() throws Exception {
        CardManager cardManager = new CardManager(Util.hexStringToByteArray(appletID));
        cardsList = cardManager.connectToAllCardsByTerminalFactory(TerminalFactory.getDefault());
        pingPlayers = new ArrayList<>();
        for (CardChannel cardChannel : cardsList) {
            pingPlayers.add(new Ping(cardChannel));
        }
    }

    /**
     * Measures durations of parallel communication with 1, 2, ..., n {@link Ping} participants
     * @return a list of durations l, where l[i] = duration of parallel communication with i + 1 participants
     * @throws GeneralMPCOPException in case something fails
     */
    public ArrayList<Long> ping() throws GeneralMPCOPException {

        ArrayList<Long> durations = new ArrayList<>();
        ArrayList<Thread> threads = new ArrayList<>();
        while (durations.size() < pingPlayers.size()) {
            durations.add(0L);
        }

        for (int participantCount = 0; participantCount < pingPlayers.size(); participantCount++) {
            long operationStart = System.currentTimeMillis();


            for (int participantIndex = 0; participantIndex <= participantCount; participantIndex++) {
                Ping player = pingPlayers.get(participantIndex);
                Thread t = new Thread(player);
                t.start();
                threads.add(t);
            }

            // wait for all threads to finish
            threads.forEach((Thread t) -> {
                try {
                    t.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });

            durations.set(participantCount, System.currentTimeMillis() - operationStart);

            checkErrors();

        }
        return durations;
    }

    /**
     * Checks if an error occurred during communication with cards
     * @throws GeneralMPCOPException if an error occurred
     */
    private void checkErrors() throws GeneralMPCOPException {
        for (Ping player : pingPlayers) {
            Optional<String> lastError = player.lastError;
            if (lastError.isPresent()) {
                throw new GeneralMPCOPException(lastError.get());
            }
        }
    }
}
