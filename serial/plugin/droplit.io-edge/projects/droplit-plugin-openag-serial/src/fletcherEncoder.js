"use strict";
exports.__esModule = true;
/**
 * https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 *
 * 8-bit implementation (16-bit checksum)
 *
 * This implementation was not written with optimization
 * in mind. There are ways to optimize this code if needed
*/
var FletcherEncoder = /** @class */ (function () {
    function FletcherEncoder() {
    }
    FletcherEncoder.prototype.checksum = function (data) {
        var sum0 = 0;
        var sum1 = 0;
        data.forEach(function (byte) {
            sum0 = (sum0 + byte) % 0xFF;
            sum1 = (sum1 + sum0) % 0xFF;
        });
        return { sum0: sum0, sum1: sum1 };
    };
    FletcherEncoder.prototype.encode = function (data) {
        var _a = this.checksum(data), sum0 = _a.sum0, sum1 = _a.sum1;
        var chk0 = 0xFF - ((sum0 + sum1) % 0xFF);
        var chk1 = 0xFF - ((sum0 + chk0) % 0xFF);
        var fletcher = Buffer.from([chk0, chk1]);
        return Buffer.concat([data, fletcher], data.length + 2);
    };
    FletcherEncoder.prototype.decode = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this.checksum(data), sum0 = _a.sum0, sum1 = _a.sum1;
            if (sum0 || sum1)
                reject('checksum must evaluate to 0x00');
            resolve(data.slice(0, data.length - 2));
        });
    };
    return FletcherEncoder;
}());
exports.FletcherEncoder = FletcherEncoder;
