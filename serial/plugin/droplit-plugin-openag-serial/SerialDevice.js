"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var CobsEncoder_1 = require("./CobsEncoder");
var SerialPort = require("serialport");
var async_1 = require("async");
var timers_1 = require("timers");
var FletcherChecksum_1 = require("./FletcherChecksum");
var SerialDevice = /** @class */ (function () {
    function SerialDevice(options) {
        var _this = this;
        // ms between acknowledgement checks
        this.interval = 50;
        this.acknowledged = [false, false];
        this.sequence = 0x0;
        this.connected = false;
        this.requestTimeout = options.responseTimeout;
        this.maxRetries = options.maxRetries;
        this.delimiter = options.delimiter;
        this.encoder = new CobsEncoder_1.CobsEncoder(this.delimiter);
        this.devicePath = options.devicePath;
        this.serialPort = new SerialPort(this.devicePath, options);
        this.serialPort.on('open', function () { return _this.onOpen(_this.delimiter); });
        // 1: only process one request at a time
        this.requestQueue = async_1.queue(this.repeatRequest.bind(this), 1);
    }
    SerialDevice.prototype.onOpen = function (delimiter) {
        var _this = this;
        this.connected = true;
        var parser = this.serialPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: delimiter }));
        parser.on('data', function (data) { return _this.onData(data); });
        this.serialPort.on('error', function (err) { return _this.onError(err); });
        this.serialPort.on('close', function (err) { return _this.onClose(err); });
    };
    SerialDevice.prototype.onData = function (data) {
        var payload = this.unwrap(data);
        var bytes = payload.length;
        if (bytes == 2 || bytes == 4) {
            var sequence = payload[0];
            console.log('onData');
            if (this.sequence !== sequence) {
                throw 'Synchronization Fault';
            }
            this.acknowledged[sequence] = true;
            if (bytes == 4) {
                // TODO: Read value and raise event
            }
        }
    };
    SerialDevice.prototype.wrap = function (msg) {
        console.log('wrap');
        var seq = Buffer.from([this.sequence]);
        var payload = Buffer.concat([seq, msg]);
        var sum = FletcherChecksum_1.FletcherChecksum.generate(payload);
        var data = FletcherChecksum_1.FletcherChecksum.append(payload, sum);
        var encoded = this.encoder.pack(data);
        var delim = Buffer.from([this.delimiter]);
        var frame = Buffer.concat([new Buffer(encoded), delim]);
        return frame;
    };
    SerialDevice.prototype.unwrap = function (data) {
        // TODO: unwrap should remove sequence
        var decoded = this.encoder.unpack(data);
        if (FletcherChecksum_1.FletcherChecksum.valid(decoded)) {
            var payload = FletcherChecksum_1.FletcherChecksum.strip(decoded);
            return Buffer.from(payload.buffer);
        }
        return Buffer.from([]);
    };
    SerialDevice.prototype.onError = function (err) {
    };
    SerialDevice.prototype.onClose = function (err) {
        if (err && err.disconnect == true) {
            // Disconnect Message
        }
        this.connected = false;
    };
    SerialDevice.prototype.sendMessage = function (msg) {
        this.requestQueue.push(msg, function (result) {
            console.log('finished processing message');
            console.log(result);
        });
    };
    SerialDevice.prototype.deliver = function (msg, timeout) {
        var _this = this;
        this.serialPort.write(msg);
        return new Promise(function (resolve, reject) {
            var intervalId = setInterval(function () {
                console.log('interval');
                console.log('deliver');
                if (_this.acknowledged[_this.sequence]) {
                    timers_1.clearInterval(intervalId);
                    resolve('acknowledgement received');
                }
            }, _this.interval);
            setTimeout(function () {
                timers_1.clearInterval(intervalId);
                reject('timed out');
            }, timeout);
        });
    };
    /**
     * stop and wait implementation of automatic repeat request
     */
    SerialDevice.prototype.repeatRequest = function (msg, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var frame, timeout, sucess, retry, val, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // alternating bit sequence
                        console.log('repeatRequest');
                        this.sequence = (this.sequence === 0x0) ? 0x1 : 0x0;
                        frame = this.wrap(msg);
                        timeout = this.requestTimeout;
                        sucess = false;
                        retry = 0;
                        _a.label = 1;
                    case 1:
                        if (!(retry < this.maxRetries)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.deliver(frame, timeout)];
                    case 3:
                        val = _a.sent();
                        console.log(val);
                        sucess = true;
                        return [3 /*break*/, 7];
                    case 4:
                        err_1 = _a.sent();
                        console.log(err_1);
                        timeout *= 2;
                        return [3 /*break*/, 5];
                    case 5:
                        console.log(retry);
                        _a.label = 6;
                    case 6:
                        retry++;
                        return [3 /*break*/, 1];
                    case 7:
                        callback(sucess);
                        return [2 /*return*/];
                }
            });
        });
    };
    return SerialDevice;
}());
exports.SerialDevice = SerialDevice;
