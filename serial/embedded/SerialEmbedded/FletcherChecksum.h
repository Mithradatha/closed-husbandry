
#ifndef __FLETCHERCHECKSUM_H__
#define __FLETCHERCHECKSUM_H__

/**
 * https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 * 
 * 8-bit implementation (16-bit checksum)
 * 
 * This implementation was not written with optimization
 * in mind. There are ways to optimize this code if needed
*/

#include "Arduino.h"

namespace FletcherChecksum
{
uint16_t generate(const uint8_t *src, const size_t sz);
void append(uint8_t *src, size_t sz, uint16_t sum);
void strip(uint8_t *src, size_t sz, uint8_t *dst);
boolean valid(const uint8_t *src, const size_t sz);

// Tests
boolean test_generate_2();
boolean test_generate_5();
boolean test_generate_6();
boolean test_generate_8();

boolean test_strip_2();

boolean test_append_2();

boolean test_valid_2();
};

#endif
