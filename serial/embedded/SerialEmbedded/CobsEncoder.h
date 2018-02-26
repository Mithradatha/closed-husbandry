
#ifndef __COBSENCODER_H__
#define __COBSENCODER_H__

/**
 * https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing
 * 
 * This encoding is limited to 255 bytes
 *
 * If the frame size needs to be larger,
 * include a modulo operation when packing
 */

#include "Arduino.h"

class CobsEncoder
{
public:
  CobsEncoder(const uint8_t);
  size_t pack(const uint8_t *, const size_t, uint8_t *);
  size_t unpack(const uint8_t *, const size_t, uint8_t *);

  // Tests
  boolean test_pack_2();
  boolean test_pack_5();

  boolean test_unpack_2();
  boolean test_unpack_5();

private:
  const uint8_t _delim;
};

#endif
