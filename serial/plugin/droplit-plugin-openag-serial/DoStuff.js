"use strict";
exports.__esModule = true;
var CobsEncoder_1 = require("./CobsEncoder");
var FletcherChecksum_1 = require("./FletcherChecksum");
var AvailablePorts = require('serialport');
var SerialPort = require("serialport");
var DoStuff = /** @class */ (function () {
    function DoStuff() {
        var _this = this;
        this.BAUD_RATE = 9600;
        this.DELIMITER = 0x0;
        this.devices = new Map();
        this.serialPorts = new Map();
        AvailablePorts.list()
            .then(function (ports) { return _this.connect(ports); })["catch"](function (err) { return console.log("uh oh"); });
        this.encoder = new CobsEncoder_1.CobsEncoder(this.DELIMITER);
        // class Delimiter extends Stream.Transform {
        // 	constructor(options: {delimiter: string | Buffer | number[]});
        // }
    }
    DoStuff.prototype.connect = function (ports) {
        var _this = this;
        ports.forEach(function (port) {
            var devicePath = port.comName;
            var serial = new SerialPort(devicePath, { baudRate: _this.BAUD_RATE });
            serial.on('open', function (data) {
                _this.onOpen(devicePath, serial);
            });
        });
    };
    DoStuff.prototype.onOpen = function (devicePath, serial) {
        var _this = this;
        var parser = serial.pipe(new SerialPort.parsers.Delimiter({ delimiter: [this.DELIMITER] }));
        parser.on('data', function (data) { return _this.onData(devicePath, data); });
        serial.on('error', function (err) { return _this.onError(devicePath, err); });
        serial.on('close', function (err) { return _this.onClose(devicePath, err); });
        this.serialPorts.set(devicePath, serial);
        this.devices.set(devicePath, { 'BinarySwitch.switch': 'off' });
        console.log('Opened Connection: ' + devicePath);
    };
    DoStuff.prototype.onData = function (devicePath, data) {
        //console.log(data);
        var decoded = this.encoder.unpack(data);
        //console.log(decoded);
        if (FletcherChecksum_1.FletcherChecksum.valid(decoded)) {
            var payload = FletcherChecksum_1.FletcherChecksum.strip(decoded);
            console.log(payload);
            this.deliver(devicePath, payload);
        }
    };
    DoStuff.prototype.onError = function (devicePath, err) {
    };
    DoStuff.prototype.onClose = function (devicePath, err) {
        if (err && err.disconnect == true) {
            // Disconnect Message
        }
        this.serialPorts["delete"](devicePath);
    };
    DoStuff.prototype.deliver = function (devicePath, payload) {
        var sum = FletcherChecksum_1.FletcherChecksum.generate(payload);
        var data = FletcherChecksum_1.FletcherChecksum.append(payload, sum);
        var encoded = this.encoder.pack(data);
        var msg = Buffer.concat([new Buffer(encoded), new Buffer([this.DELIMITER])]);
        this.serialPorts.get(devicePath).write(msg);
    };
    return DoStuff;
}());
exports.DoStuff = DoStuff;
