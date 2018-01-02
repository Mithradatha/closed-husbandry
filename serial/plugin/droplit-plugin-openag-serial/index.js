"use strict";
exports.__esModule = true;
var CobsEncoder_1 = require("./CobsEncoder");
var FletcherChecksum_1 = require("./FletcherChecksum");
console.log("FletcherChecksum");
console.log(FletcherChecksum_1.FletcherChecksum.test_generate_2());
console.log(FletcherChecksum_1.FletcherChecksum.test_generate_5());
console.log(FletcherChecksum_1.FletcherChecksum.test_generate_6());
console.log(FletcherChecksum_1.FletcherChecksum.test_generate_8());
console.log(FletcherChecksum_1.FletcherChecksum.test_append_2());
console.log(FletcherChecksum_1.FletcherChecksum.test_strip_2());
console.log(FletcherChecksum_1.FletcherChecksum.test_valid_2());
console.log();
var encoder = new CobsEncoder_1.CobsEncoder(0x0);
console.log("CobsEncoder");
console.log(encoder.test_pack_2());
console.log(encoder.test_pack_5());
console.log(encoder.test_unpack_2());
console.log(encoder.test_unpack_5());
console.log();
// let device = new SerialDevice({
//     devicePath: 'COM5',
//     baudRate: 9600,
//     delimiter: [0x0]
// });
// device.sendMessage(Buffer.from([0x31]));
// console.log("Framing");
// let payload = new Uint8Array([0x3, 0x0, 0x1]);
// const sum: Uint8Array = FletcherChecksum.generate(payload);
// let data: Uint8Array = FletcherChecksum.append(payload, sum);
// let encoded: Uint8Array = encoder.pack(data);
// let decoded: Uint8Array = encoder.unpack(encoded);
// if (FletcherChecksum.valid(decoded)) {
//     let msg: Uint8Array = FletcherChecksum.strip(decoded);
//     console.log(msg.length == 3 &&
//         msg[0] == 0x3 && msg[1] == 0x0 && msg[2] == 0x1);
// } else {
//     console.log("invalid");
// }
// let dostuff = new DoStuff();
// const maxRetries: number = 3;
// const initTimeout: number = 1000;
// const interval: number = 50;
// let acknowledged: boolean[] = [false, false];
// type Sequence = 0x0 | 0x1;
// let sequence: Sequence = 0x0;
// function deliver(msg: string, timeout: number): Promise<any> {
//     //wrap(msg);
//     //write(msg);
//     return new Promise((resolve, reject) => {
//         const intervalId = setInterval(() => {
//             console.log('interval');
//             if (acknowledged[sequence]) {
//                 clearInterval(intervalId);
//                 resolve('acknowledgement received');
//             }
//         }, interval);
//         setTimeout(() => {
//             clearInterval(intervalId);
//             reject('timed out');
//         }, timeout);
//     });
// }
// function onAcknowledgement(sequence: Sequence) {
//     acknowledged[sequence] = true;
// }
// let q = queue(async function (msg: string, callback) {
//     // flip sequence
//     sequence = (sequence === 0x0) ? 0x1 : 0x0;
//     let timeout = initTimeout;
//     for (let retry = 0; retry < maxRetries; retry++) {
//         try {
//             let val = await deliver(msg, timeout);
//             console.log(val);
//             break;
//         } catch (err) {
//             console.log(err);
//             timeout *= 2;
//         }
//         console.log(retry);
//     }
//     callback();
// }, 1);
// q.push('foo', function (err) {
//     console.log('finished processing foo');
// });
// setTimeout(() => { onAcknowledgement(sequence); }, 1500);
