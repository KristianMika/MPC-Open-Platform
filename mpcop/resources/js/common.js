var eventBus = new EventBus("/mpcop-event-bus");

eventBus.onopen = function () {
	eventBus.registerHandler(
		"service.controller-register",
		eventRequestsProcessing
	);
};
var operations = ["INFO", "KEYGEN", "RESET", "GET_PUBKEY", "SIGN", "DECRYPT"];

// Form
var sendButton = document.getElementById("sendRequest");
var operation = document.getElementById("operation");
var data = document.getElementById("data");
var requestForm = document.getElementById("pseudo-form");
var responceArea = document.getElementById("responseArea");
var enableDebugButton = document.getElementById("enableDebug");
var loader = document.getElementById("loader");

// Debug footer
var debugFooter = document.getElementById("footerLogger");
var footerLoggerTextArea = document.getElementById("footerLoggerTextArea");

// Utils
function toTwoPlaces(num) {
	return num.toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false,
	});
}

function getDate() {
	let currentDate = new Date();
	return (
		currentDate.getDate() +
		"." +
		currentDate.getMonth() +
		1 +
		"." +
		currentDate.getFullYear()
	);
}

function getTime() {
	let currentDate = new Date();
	return (
		toTwoPlaces(currentDate.getHours()) +
		":" +
		toTwoPlaces(currentDate.getMinutes()) +
		":" +
		toTwoPlaces(currentDate.getSeconds())
	);
}

function updateLoggerPosition() {
	footerLoggerTextArea.scrollTop = footerLoggerTextArea.scrollHeight;
}

function log(message) {
	var finalMessae = getDate() + " - " + getTime() + ": " + message;
	footerLoggerTextArea.value =
		footerLoggerTextArea.value + "\n" + finalMessae;
	updateLoggerPosition();
}

function logRequest(body) {
	log("Sending request: body = " + JSON.stringify(body));
}

function verifySignature(plaintext, body) {
	var sigVerif = verifySchnorrSignature(
		plaintext,
		document.getElementById("yagg-value").textContent,
		body["sig1"],
		body["sig2"]
	);

	var msg = "";
	if (sigVerif === true) {
		msg = "Signature verification has been successful.";
	} else {
		msg = "Signature verification has failed.";
	}

	alert(msg);
	log(msg);
}

// On load
window.onload = function () {
	footerLoggerTextArea.value = "";
	data.value = "";
};

function setResponse(response) {
	responceArea.textContent = response;
}

function appendResponse(response) {
	responseArea.textContent = responseArea.textContent + "\n" + response;
}

function setPublicKey(pubKey) {
	var yaggVal = document.getElementById("yagg-value");
	yaggVal.textContent = pubKey;
	log("Public key has been successfully set.");
}

var last_plaintext = "";
function handleResponse(body) {
	if (!checkResponseStatus(body)) {
		setResponse(body["errMessage"]);
		return false;
	}
	switch (body.operation) {
		case "SIGN":
			setResponse("s: " + body["sig1"]);
			appendResponse("e: " + body["sig2"]);
			verifySignature(last_plaintext, body);
			break;

		case "GET_PUBKEY":
			setPublicKey(body["publicKey"]);
			break;

		case "KEYGEN":
			setPublicKey(body["publicKey"]);
			break;

		default:
			responceArea.textContent = body.message;
	}
}

function checkResponseStatus(body) {
	return body.success === true;
}

var protocol = window.location.href.split("/").pop();

requestForm.onsubmit = function (event) {
	event.preventDefault();
	last_plaintext = data.value;

	if (!operations.includes(operation.value)) {
		log("Invalid operation " + operation.value);
		return false;
	}

	toggle_loader("ON");
	var body = {
		operation: operation.value,
		data: data.value,
		protocol: protocol,
	};

	logRequest(body);

	eventBus.send("service.controller", body, function (a, msg) {
		if (msg == null) {
			setResponse("ERROR: response null");
			log("An error occured: the back-end hasn't responded");
		} else {
			log("Received response: " + msg.body);
			var bodyJson = JSON.parse(msg.body);

			handleResponse(bodyJson);
		}

		toggle_loader("OFF");
	});

	return false;
};

function eventRequestsProcessing(err, msg) {
	console.log(msg);
	/*
    // TODO: TMP, remove 
    // responceArea.textContent = msg.body;
    var event = msg.body;

    if (event.type == 'publish') { // it's a response from the backend
        // responceArea.textContent = event.message;

    } else { //change of number of users.
        //type: register or close.

    }
    */
}

// Debug log
enableDebugButton.addEventListener("click", function () {
	if (debugFooter.classList.contains("hidden")) {
		debugFooter.classList.remove("hidden");
	} else {
		debugFooter.classList.add("hidden");
	}
});

// Toggle loader
function toggle_loader(loader_status) {
	if (loader_status === "ON") {
		loader.classList.remove("hidden");
	} else {
		loader.classList.add("hidden");
	}
}
