"use strict";
/**
 * https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 *
 * 8-bit implementation (16-bit checksum)
 *
 * This implementation was not written with optimization
 * in mind. There are ways to optimize this code if needed
*/
exports.__esModule = true;
var FletcherChecksum;
(function (FletcherChecksum) {
    function generate(src) {
        var sum0 = 0;
        var sum1 = 0;
        src.forEach(function (elem) {
            sum0 = (sum0 + elem) % 255;
            sum1 = (sum1 + sum0) % 255;
        });
        return new Buffer([sum1, sum0]);
    }
    FletcherChecksum.generate = generate;
    function append(src, sum) {
        var sum0 = sum[1];
        var sum1 = sum[0];
        var chk0 = 255 - ((sum0 + sum1) % 255);
        var chk1 = 255 - ((sum0 + chk0) % 255);
        var len = src.length;
        var res = new Buffer(len + 2);
        for (var i = 0; i < len; i++) {
            res[i] = src[i];
        }
        res[len] = chk0;
        res[len + 1] = chk1;
        return res;
    }
    FletcherChecksum.append = append;
    function strip(src) {
        return Buffer.from(src.slice(0, src.length - 2));
    }
    FletcherChecksum.strip = strip;
    function valid(src) {
        var sum = generate(src);
        return sum[0] == 0 && sum[1] == 0;
    }
    FletcherChecksum.valid = valid;
    //======================================
    // Tests
    //====================================== 
    function test_generate_2() {
        // Arrange
        var msg = new Buffer([0x01, 0x02]);
        // Act
        var sum = generate(msg);
        // Assert
        var pass = sum[0] == 0x04 && sum[1] == 0x03;
        return pass;
    }
    FletcherChecksum.test_generate_2 = test_generate_2;
    function test_generate_5() {
        // Arrange ("abcde")
        var msg = new Buffer([97, 98, 99, 100, 101]);
        // Act
        var sum = generate(msg);
        // Assert
        var pass = sum[0] == 0xC8 && sum[1] == 0xF0;
        return pass;
    }
    FletcherChecksum.test_generate_5 = test_generate_5;
    function test_generate_6() {
        // Arrange ("abcdef")
        var msg = new Buffer([97, 98, 99, 100, 101, 102]);
        // Act
        var sum = generate(msg);
        // Assert
        var pass = sum[0] == 0x20 && sum[1] == 0x57;
        return pass;
    }
    FletcherChecksum.test_generate_6 = test_generate_6;
    function test_generate_8() {
        // Arrange ("abcdefgh")
        var msg = new Buffer([97, 98, 99, 100, 101, 102, 103, 104]);
        // Act
        var sum = generate(msg);
        // Assert
        var pass = sum[0] == 0x06 && sum[1] == 0x27;
        return pass;
    }
    FletcherChecksum.test_generate_8 = test_generate_8;
    function test_append_2() {
        // Arrange ("abcdefgh")
        var sum = new Buffer([0x04, 0x03]);
        var msg = new Buffer([0x01, 0x02]);
        // Act
        var data = append(msg, sum);
        // Assert
        var pass = data[2] == 0xF8 && data[3] == 0x04;
        return pass;
    }
    FletcherChecksum.test_append_2 = test_append_2;
    function test_strip_2() {
        // Arrange
        var data = new Buffer([0x01, 0x02, 0xF8, 0x04]);
        // Act
        var msg = strip(data);
        // Assert
        return msg.length == 2 && msg[0] == 0x01 && msg[1] == 0x02;
    }
    FletcherChecksum.test_strip_2 = test_strip_2;
    function test_valid_2() {
        // Arrange
        var msg = new Buffer([0x01, 0x02, 0xF8, 0x04]);
        // Act
        var isValid = valid(msg);
        // Assert
        return isValid;
    }
    FletcherChecksum.test_valid_2 = test_valid_2;
})(FletcherChecksum = exports.FletcherChecksum || (exports.FletcherChecksum = {}));
