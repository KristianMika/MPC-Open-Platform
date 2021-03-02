var eventBus = new EventBus("/mpcop-event-bus");

eventBus.onopen = function() {
    eventBus.registerHandler("service.controller-register", eventRequestsProcessing);
}

// Form
var sendButton = document.getElementById('sendRequest');
var operation = document.getElementById('operation');
var data = document.getElementById('data');
var requestForm = document.getElementById('pseudo-form');
var responceArea = document.getElementById('responseArea');
var enableDebugButton = document.getElementById("enableDebug");

// Debug footer
var debugFooter = document.getElementById("footerLogger");
var footerLoggerTextArea = document.getElementById("footerLoggerTextArea");

// Utils
function toTwoPlaces(num) {
    return num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
}

function getDate() {
    let currentDate = new Date()
    return currentDate.getDate() + "." + currentDate.getMonth() + 1 + "." + currentDate.getFullYear()
}

function getTime() {
    let currentDate = new Date()
    return toTwoPlaces(currentDate.getHours()) + ":" +
        toTwoPlaces(currentDate.getMinutes()) + ":" +
        toTwoPlaces(currentDate.getSeconds());
}

function updateLoggerPosition() {
    footerLoggerTextArea.scrollTop = footerLoggerTextArea.scrollHeight;
}

function log(message) {
    var finalMessae = getDate() + " - " + getTime() + ": " + message
    footerLoggerTextArea.value = footerLoggerTextArea.value + '\n' + finalMessae;
    updateLoggerPosition();
}

// On load
window.onload = function() {
    debugFooter.style.display = 'none';
    footerLoggerTextArea.value = '';
}

var protocol = window.location.href.split("/").pop();

requestForm.onsubmit = function(event) {
    event.preventDefault();
    var message = {
        "operation": operation.value,
        "data": data.value
    };

    log("Sending request: " + JSON.stringify(message))

    eventBus.send("service.controller." + protocol, message, null, function(a, msg) {
        if (msg == null) {
            responceArea.textContent = "ERROR: response null";
            log("An error occured: the back-end hasn't responded")
        } else {

            // TMP walkaround
            if ((operation.value == "Keygen" || operation.value == "GetYagg") && msg.body.length > 20) {
                log("Received public key");
                var yaggVal = document.getElementById("yagg-value");
                log("Setting public key");
                yaggVal.textContent = msg.body;
                responceArea.textContent = "OK";
            } else {
                responceArea.textContent = msg.body;
            }

            log("Received response: " + msg.body)
        }
    });
    data.value = '';

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


enableDebugButton.addEventListener("click", function() {

    if (debugFooter.style.display == 'none') {
        debugFooter.style.display = '';
    } else {
        debugFooter.style.display = 'none';
    }
})
