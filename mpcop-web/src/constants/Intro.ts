/**
 * Intro messages are displayed when the user presses the help button
 */
export class IntroMessage {
	static HEADER_BUTTONS =
		"To navigate on the website, use the navigation header. You can choose between the home (status) page, supported MPC protocols, and the Ping page dedicated to performance testing.";
	static PROTOCOL_NAME =
		"This is the currently selected protocol. Using the main control panel on this page won't affect other protocols.";
	static HEADER_DRAWER =
		"To navigate on the website, use the navigation menu. You can choose between the home (status) page, supported MPC protocols, and the Ping page dedicated to performance testing.";
	static HOME_PAGE_STATUS =
		"This page contains information about the MPC Open Platform server.";
	static PUBLIC_KEY_FIELD =
		"This field contains the public key encoded in hex format. You can not modify this field - it is filled automatically after the protocol has generated the public key.";
	static DATA_OUTPUT_FIELD =
		'Here you can find outputs of performed operation, e.g., a signature after the "sign" operation.';
	static INPUT_DATA_FIELD =
		'If the selected operation takes arguments, e.g., the "sign" operation takes data to sign, you can input a hex-encoded string, and it will be passed as an input argument to the protocol. We have already filled-in some test data (a SHA2 hash of the word "password").';
	static PROTOCOL_BUTTONS =
		"These are the operations that you can perform with the currently-selected protocol. Hover above individual buttons for a more thorough description.";
	static DEBUG_BUTTON =
		"You can open a debug console by clicking the `debug` button. The debug console reveals what's going on under the hood and shows a detailed history of received messages from the server.";
	static PROTOCOL_INFO =
		"The results of individual operations and any warnings and information messages will be displayed here.";
	static PROTOCOL_SETUP =
		"The protocol can be customized using this setup area. Be careful, however. Customizing the protocol can irreversibly erase cryptographic secrets!";
	static PING =
		"This area is used for performance measurement. First, click the 'FIND CARDS' button. The application will connect to all cards with the ping applet on them. Then, select the number of requests over which the final measurement will be averaged. And finally, ping the cards.";
	static PING_BAR =
		"This stacked bar represents durations of subsequent phases during the ping performance test with respect to the number of players participating in the measurement.";
	static PING_BUTTONS =
		"Once the measurement has finished, you can download your measurement data in CSV format. (a 'DOWNLOAD CSV' button will appear in this area)";
}
