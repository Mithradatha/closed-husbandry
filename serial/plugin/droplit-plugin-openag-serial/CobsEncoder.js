"use strict";
/**
 * https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing
 *
 * This encoding is limited to 255 bytes
 *
 * If the packet size needs to be larger,
 * include a modulo operation when packing
 */
exports.__esModule = true;
var CobsEncoder = /** @class */ (function () {
    function CobsEncoder(delim) {
        this._delim = delim;
    }
    CobsEncoder.prototype.pack = function (src) {
        var sz = src.length;
        var dst = new Buffer(sz + 1);
        var srcx = 0;
        var dstx = 0;
        var delimx = 0;
        var fill = function () {
            dst[dstx++] = srcx - delimx + 1;
            for (var i = delimx; i < srcx; i++) {
                dst[dstx++] = src[i];
            }
        };
        for (; srcx < sz; srcx++) {
            if (src[srcx] === this._delim) {
                fill();
                delimx = srcx + 1;
            }
        }
        if (srcx !== delimx) {
            fill();
        }
        return dst;
    };
    CobsEncoder.prototype.unpack = function (src) {
        var sz = src.length;
        var dst = new Buffer(sz - 1);
        var srcx = 0;
        var dstx = 0;
        var delimx = 0;
        while (srcx < sz) {
            var token = src[srcx++];
            delimx = srcx + token - 1;
            for (; srcx < delimx; srcx++) {
                dst[dstx++] = src[srcx];
            }
            if (srcx < sz) {
                dst[dstx++] = this._delim;
            }
        }
        return dst;
    };
    //======================================
    // Tests
    //======================================
    CobsEncoder.prototype.test_pack_2 = function () {
        // Arrange
        var msg = new Buffer([0x0, 0x1]);
        // Act
        var encoded = this.pack(msg);
        // Assert
        return encoded[0] == 1 && encoded[1] == 2 && encoded[2] == 0x1;
    };
    CobsEncoder.prototype.test_pack_5 = function () {
        // Arrange
        var msg = new Buffer([0x30, 0x33, 0x35, 0x30, 0x34]);
        // Act
        var encoded = this.pack(msg);
        // Assert
        return encoded[0] == 6 && encoded[5] == 0x34;
    };
    CobsEncoder.prototype.test_unpack_2 = function () {
        // Arrange
        var encoded = new Buffer([1, 2, 0x1]);
        // Act
        var decoded = this.unpack(encoded);
        // Assert
        return decoded[0] == 0x0 && decoded[1] == 0x1;
    };
    CobsEncoder.prototype.test_unpack_5 = function () {
        // Arrange
        var msg = new Buffer([6, 0x30, 0x33, 0x35, 0x30, 0x34]);
        // Act
        var decoded = this.unpack(msg);
        // Assert
        return decoded[0] == 0x30 && decoded[4] == 0x34;
    };
    return CobsEncoder;
}());
exports.CobsEncoder = CobsEncoder;
