/**
 * Connects to a Bluetooth device.
 * The background color shows if a Bluetooth device is connected (green) or
 * disconnected (red).
 * Allows to interact with the characteristics of the micro:bit Bluetooth UART
 * service.
 */

var bluetoothDevice;



/**
 * Object containing the Bluetooth UUIDs of all the services and
 * characteristics of the micro:bit.
 */
microbitUuid = {
    /**
     * Services
     */
    genericAccess:                              ["00001800-0000-1000-8000-00805f9b34fb", "Generic Access"],
    genericAttribute:                           ["00001801-0000-1000-8000-00805f9b34fb", "Generic Attribute"],
    deviceInformation:                          ["0000180a-0000-1000-8000-00805f9b34fb", "Device Information"],
    accelerometerService:                       ["e95d0753-251d-470a-a062-fa1922dfa9a8", "Accelerometer Service"],
    magnetometerService:                        ["e95df2d8-251d-470a-a062-fa1922dfa9a8", "Magnetometer Service"],
    buttonService:                              ["e95d9882-251d-470a-a062-fa1922dfa9a8", "Button Service"],
    ioPinService:                               ["e95d127b-251d-470a-a062-fa1922dfa9a8", "IO Pin Service"],
    ledService:                                 ["e95dd91d-251d-470a-a062-fa1922dfa9a8", "LED Service"],
    eventService:                               ["e95d93af-251d-470a-a062-fa1922dfa9a8", "Event Service"],
    dfuControlService:                          ["e95d93b0-251d-470a-a062-fa1922dfa9a8", "DFU Control Service"],
    temperatureService:                         ["e95d6100-251d-470a-a062-fa1922dfa9a8", "Temperature Service"],
    uartService:                                ["6e400001-b5a3-f393-e0a9-e50e24dcca9e", "UART Service"],
    /**
     * Characteristics
     */
    deviceName:                                 ["00002a00-0000-1000-8000-00805f9b34fb", "Device Name"],
    appearance:                                 ["00002a01-0000-1000-8000-00805f9b34fb", "Appearance"],
    peripheralPreferredConnectionParameters:    ["00002a04-0000-1000-8000-00805f9b34fb", "Peripheral Preferred Connection Parameters"],
    serviceChanged:                             ["00002a05-0000-1000-8000-00805f9b34fb", "Service Changed"],
    modelNumberString:                          ["00002a24-0000-1000-8000-00805f9b34fb", "Model Number String"],
    serialNumberString:                         ["00002a25-0000-1000-8000-00805f9b34fb", "Serial Number String"],
    hardwareRevisionString:                     ["00002a27-0000-1000-8000-00805f9b34fb", "Hardware Revision String"],
    firmwareRevisionString:                     ["00002a26-0000-1000-8000-00805f9b34fb", "Firmware Revision String"],
    manufacturerNameString:                     ["00002a29-0000-1000-8000-00805f9b34fb", "Manufacturer Name String"],
    accelerometerData:                          ["e95dca4b-251d-470a-a062-fa1922dfa9a8", "Accelerometer Data"],
    accelerometerPeriod:                        ["e95dfb24-251d-470a-a062-fa1922dfa9a8", "Accelerometer Period"],
    magnetometerData:                           ["e95dfb11-251d-470a-a062-fa1922dfa9a8", "Magnetometer Data"],
    magnetometerPeriod:                         ["e95d386c-251d-470a-a062-fa1922dfa9a8", "Magnetometer Period"],
    magnetometerBearing:                        ["e95d9715-251d-470a-a062-fa1922dfa9a8", "Magnetometer Bearing"],
    magnetometerCalibration:                    ["e95db358-251d-470a-a062-fa1922dfa9a8", "Magnetometer Calibration"],
    buttonAState:                               ["e95dda90-251d-470a-a062-fa1922dfa9a8", "Button A State"],
    buttonBState:                               ["e95dda91-251d-470a-a062-fa1922dfa9a8", "Button B State"],
    pinData:                                    ["e95d8d00-251d-470a-a062-fa1922dfa9a8", "Pin Data"],
    pinADConfiguration:                         ["e95d5899-251d-470a-a062-fa1922dfa9a8", "Pin AD Configuration"],
    pinIOConfiguration:                         ["e95db9fe-251d-470a-a062-fa1922dfa9a8", "Pin IO Configuration"],
    pwmControl:                                 ["e95dd822-251d-470a-a062-fa1922dfa9a8", "PWM Control"],
    ledMatrixState:                             ["e95d7b77-251d-470a-a062-fa1922dfa9a8", "LED Matrix State"],
    ledText:                                    ["e95d93ee-251d-470a-a062-fa1922dfa9a8", "LED Text"],
    scrollingDelay:                             ["e95d0d2d-251d-470a-a062-fa1922dfa9a8", "Scrolling Delay"],
    microbitRequirements:                       ["e95db84c-251d-470a-a062-fa1922dfa9a8", "MicroBit Requirements"],
    microbitEvent:                              ["e95d9775-251d-470a-a062-fa1922dfa9a8", "MicroBit Event"],
    clientRequirements:                         ["e95d23c4-251d-470a-a062-fa1922dfa9a8", "Client Requirements"],
    clientEvent:                                ["e95d5404-251d-470a-a062-fa1922dfa9a8", "Client Event"],
    dfuControl:                                 ["e95d93b1-251d-470a-a062-fa1922dfa9a8", "DFU Control"],
    temperature:                                ["e95d9250-251d-470a-a062-fa1922dfa9a8", "Temperature"],
    temperaturePeriod:                          ["e95d1b25-251d-470a-a062-fa1922dfa9a8", "Temperature Period"],
    txCharacteristic:                           ["6e400003-b5a3-f393-e0a9-e50e24dcca9e", "Tx Characteristic"],
    rxCharacteristic:                           ["6e400002-b5a3-f393-e0a9-e50e24dcca9e", "Rx Characteristic"],
    /**
     * Method that searches an UUID among the UUIDs of all the services and
     * characteristics and returns:
     * - in HTML blue color the name of the service/characteristic found.
     * - in HTML red color a message if the UUID has not been found.
     * @param uuid The service or characteristic UUID.
     * @param serviceOrCharacteristic True (or 1) if it is a service, and false
     * (or 0) if it is a characteristic.
     */
    searchUuid(uuid, serviceOrCharacteristic) {
        for (const key in microbitUuid) {
            if (uuid === microbitUuid[key][0]) {
                return "<font color='blue'>" + microbitUuid[key][1] + "</font>";
            }
        }
        if (serviceOrCharacteristic) {
            return "<font color='red'>Unknown Micro:Bit Service</font>";
        } else {
            return "<font color='red'>Unknown Micro:Bit Characteristic</font>";
        }
    },
}



/**
 * Function that adds string to the log. If newLine is true, it adds a new line
 * at the end of the string.
 * @param string String to print to the log.
 * @param newLine Boolean that specifies whether to start a new line or not.
 */
function addLog(string, newLine) {
    document.getElementById("log").innerHTML += string;
    if (newLine) {
        document.getElementById("log").innerHTML += "<br>";
    };
}

/**
 * Function that adds string (and newline) to the log in bold and red color.
 * @param string String to print to the log.
 */
function addLogError(string) {
    addLog("<b><font color='red'>" + string + "</font></b>", true);
}

/**
 * Function that empties the log.
 */
function clearLog() {
    document.getElementById("log").innerHTML = "";
}

/**
 * Function that empties the UART TX field.
 */
function clearTx() {
    document.getElementById("tx").innerHTML = "";
    document.getElementById("tx_last").innerHTML = "";
}



/**
 * Function that turns the background color red.
 */
function onDisconnected() {
    document.getElementById("body").style = "background-color:#FFD0D0";
}

/**
 * Function that shows 2-digit hexdecimal in string.
 */
 function padHex(value) {
    return ('00' + value.toString(16).toUpperCase()).slice(-2);
}

/**
 * Function that shows 4-digit hexdecimal in string.
 */
 function padDec(value) {
    return ('0000' + value.toString(10).toUpperCase()).slice(-4);
}

var txCharacteristic;
var rxCharacteristic;
var logCounter;

/**
 * Function that updates the HTML element according to the UART characteristic.
 */
function readTx(event) {
    //addLog("Reading TX... ", false);
    if (!("TextDecoder") in window) {
        addLogError("Sorry, this browser does not support TextDecoder...");
    } else {
        //let enc = new TextDecoder("utf-8");
        //document.getElementById("tx").innerHTML += enc.decode(event.target.value) + "<br>";
        document.getElementById("tx_last").innerHTML = "";
        logCounter += 0x01;
        let data_upper = padHex(event.target.value.getUint8(0)).toString(16);
        data_upper += padHex(event.target.value.getUint8(1)).toString(16);
        data_upper += padHex(event.target.value.getUint8(2)).toString(16);
        data_upper += padHex(event.target.value.getUint8(3)).toString(16);
        let data_lower = padHex(event.target.value.getUint8(4)).toString(16);
        data_lower += padHex(event.target.value.getUint8(5)).toString(16);
        data_lower += padHex(event.target.value.getUint8(6)).toString(16);
        data_lower += padHex(event.target.value.getUint8(7)).toString(16);
        document.getElementById("tx").innerHTML += "(" + padDec(logCounter).toString(10) + ") 0x" + data_upper + "|" + data_lower;
        document.getElementById("tx_last").innerHTML += "(" + padDec(logCounter).toString(10) + ") 0x" + data_upper + "|" + data_lower;

        let data_meaning = "";

        // Bit 62: OID2 / OID3
        if(event.target.value.getUint8(0) & 0x40) {
            data_meaning += " OID3 ";
        } else {
            data_meaning += " OID2 ";
        }

        // Bit 60: Valid / Invalid
        if(event.target.value.getUint8(0) & 0x10) {
            data_meaning += "Invalid Code!! ";
        } else {

            // Bit 61: General / Hand Writing
            if(!(event.target.value.getUint8(0) & 0x20)) {
                var value = 0;
                value = (value << 8) | event.target.value.getUint8(5);
                value = (value << 8) | event.target.value.getUint8(6);
                value = (value << 8) | event.target.value.getUint8(7);
                // data_meaning += "0x" + value.toString(16).toUpperCase() + " (" + value.toString(10) + ") ";
                data_meaning += " (" + value.toString(10) + ") ";

                var angle = 0;
                angle = (angle << 8) | event.target.value.getUint8(1);
                angle = (angle << 8) | event.target.value.getUint8(2);
                angle = (angle >> 5) & 0x01FF;                          // 9 bits angle value (0 - 359)
                data_meaning += "Angle " + angle.toString(10);
            }
        }
        document.getElementById("tx").innerHTML += data_meaning + "<br>";
        document.getElementById("tx_last").innerHTML += data_meaning;

        //addLog("<font color='green'>OK</font>", true);
        //let readData = event.target.value.getUint8(7).toString(16);
        //addLog("readTx data is: <font color='blue'>" + readData + "</font>", true);
    };
}

/**
 * Function that updates the command using the corresponding
 * micro:bit Bluetooth characteristic.
 */
 function writeCmd() {
    addLog("Writing command... ", false);
    if (!bluetoothDevice) {
        addLogError("There is no device connected.");
    } else {
        if (bluetoothDevice.gatt.connected) {
            if (!rxCharacteristic) {
                addLogError("There is no Magnetometer Period characteristic.");
            } else {
                let buffer = new ArrayBuffer(2);
                let oidCmd = new DataView(buffer);
                oidCmd.setUint8(0, document.getElementById("oidCommandSelect").value);
                //let oidCmdRpt = "Write 0x0" + oidCmd.getUint8(1).toString(16) + " 0x" + oidCmd.getUint8(0).toString(16) + "<br>";
                let oidCmdRpt = "Write: [0x" + padHex(oidCmd.getUint8(1)) + " 0x" + padHex(oidCmd.getUint8(0)) + "]<br>";
                document.getElementById("oidCommand").innerHTML = oidCmdRpt;
                rxCharacteristic.writeValue(oidCmd)
                .then(_ => {
                    addLog("<font color='green'>OK</font>", true);
                })
                .catch(error => {
                    addLogError(error);
                });
            };
        } else {
            addLogError("There is no device connected.");
        };
    };
}

/**
 * Function that connects to a Bluetooth device, and saves the characteristics
 * associated with the UART service.
 */
function connect() {
    addLog("Requesting Bluetooth devices... ", false);
    if (!navigator.bluetooth) {
        addErrorLog("Bluetooth not available in this browser or computer.");
    } else {
        navigator.bluetooth.requestDevice({
            // To accept all devices, use acceptAllDevices: true and remove filters.
            filters: [{namePrefix: "NUS_OID"}],
            acceptAllDevices: false,
            optionalServices: [microbitUuid.genericAccess[0], microbitUuid.genericAttribute[0], microbitUuid.deviceInformation[0], microbitUuid.accelerometerService[0], microbitUuid.magnetometerService[0], microbitUuid.buttonService[0], microbitUuid.ioPinService[0], microbitUuid.ledService[0], microbitUuid.eventService[0], microbitUuid.dfuControlService[0], microbitUuid.temperatureService[0], microbitUuid.uartService[0]],
        })
        .then(device => {
            addLog("<font color='green'>OK</font>", true);
            bluetoothDevice = device;
            addLog("Connecting to GATT server (name: <font color='blue'>" + device.name + "</font>, ID: <font color='blue'>" + device.id + "</font>)... ", false);            
            device.addEventListener('gattserverdisconnected', onDisconnected);
            document.getElementById("body").style = "background-color:#D0FFD0";
            return device.gatt.connect();
        })
        .then(server => {
            addLog("<font color='green'>OK</font>", true);
            addLog("Getting UART service (UUID: " + microbitUuid.uartService[0] + ")... ", false);
            return server.getPrimaryService(microbitUuid.uartService[0]);
        })
        .then(service => {
            addLog("<font color='green'>OK</font>", true);
            addLog("Getting TX characteristic... ", false);
            service.getCharacteristic(microbitUuid.txCharacteristic[0])
            .then(txChar => {
                addLog("<font color='green'>OK</font>", true);
                txCharacteristic = txChar;
                addLog("Starting TX notifications... ", false);
                return txChar.startNotifications()
                .then(_ => {
                    txChar.addEventListener('characteristicvaluechanged', readTx);
                    addLog("<font color='green'>OK</font>", true);
                    addLog("Getting RX characteristic... ", false);
                    service.getCharacteristic(microbitUuid.rxCharacteristic[0])
                    .then(rxChar => {
                        rxCharacteristic = rxChar;
                        addLog("<font color='green'>OK</font>", true);
                        logCounter = 0x00;
                    })
                    .catch(error => {
                        addErrorLog(error);
                    });
                })
                .catch(error => {
                    addLogError(error);
                });
            })
            .catch(error => {
                addLogError(error);
            });
        })
        .catch(error => {
            addLogError(error);
        });
    };
}

/**
 * Function that disconnects from the Bluetooth device (if connected).
 */
function disconnect() {
    addLog("Disconnecting... ", false);
    if (!bluetoothDevice) {
        addLogError("There is no device connected.");
    } else {
        if (bluetoothDevice.gatt.connected) {
            bluetoothDevice.gatt.disconnect();
            if (!bluetoothDevice.gatt.connected) {
                addLog("<font color='green'>OK</font>", true);
            }
        } else {
            addLogError("There is no device connected.");
        };
    };
}
