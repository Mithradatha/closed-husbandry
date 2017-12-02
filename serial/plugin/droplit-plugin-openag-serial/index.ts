import { CobsEncoder } from './CobsEncoder';
import { FletcherChecksum } from "./FletcherChecksum";

console.log("FletcherChecksum");
console.log(FletcherChecksum.test_generate_2());
console.log(FletcherChecksum.test_generate_5());
console.log(FletcherChecksum.test_generate_6());
console.log(FletcherChecksum.test_generate_8());
console.log(FletcherChecksum.test_append_2());
console.log(FletcherChecksum.test_valid_2());

console.log();

const encoder = new CobsEncoder(0x0);

console.log("CobsEncoder");
console.log(encoder.test_pack_2());
console.log(encoder.test_pack_5());
console.log(encoder.test_unpack_2());
console.log(encoder.test_unpack_5());