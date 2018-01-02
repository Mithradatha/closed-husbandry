/**
 * https://en.wikipedia.org/wiki/Consistent_Overhead_Byte_Stuffing
 * 
 * This encoding is limited to 255 bytes
 *
 * If the packet size needs to be larger,
 * include a modulo operation when packing
 */

#include "CobsEncoder.h"

CobsEncoder::CobsEncoder(const uint8_t delimiter = 0) : _delim(delimiter) {}

size_t CobsEncoder::pack(const uint8_t *src, const size_t sz, uint8_t *dst)
{
  size_t srcx = 0;
  size_t dstx = 0;
  size_t delimx = 0;

  for (; srcx < sz; srcx++)
  {
    if (src[srcx] == _delim)
    {
      dst[dstx++] = srcx - delimx + 1;

      for (size_t i = delimx; i < srcx; i++)
      {
        dst[dstx++] = src[i];
      }

      delimx = srcx + 1;
    }
  }

  if (srcx != delimx)
  {
    dst[dstx++] = srcx - delimx + 1;

    for (size_t i = delimx; i < srcx; i++)
    {
      dst[dstx++] = src[i];
    }
  }

  return dstx;
}

size_t CobsEncoder::unpack(const uint8_t *src, const size_t sz, uint8_t *dst)
{
  size_t srcx = 0;
  size_t dstx = 0;
  size_t delimx = 0;

  while (srcx < sz)
  {
    const uint8_t token = src[srcx++];
    delimx = srcx + (size_t)token - 1;

    for (; srcx < delimx; srcx++)
    {
      dst[dstx++] = src[srcx];
    }

    if (srcx < sz)
    {
      dst[dstx++] = _delim;
    }
  }

  return dstx;
}

//======================================
// Tests
//======================================

boolean CobsEncoder::test_pack_2()
{
  // Arrange
  uint8_t msg[] = {0x0, 0x1};
  uint8_t encoded[3];

  // Act
  CobsEncoder::pack(msg, 2, encoded);

  // Assert
  return encoded[0] == 1 && encoded[1] == 2 && encoded[2] == 0x1;
}

boolean CobsEncoder::test_pack_5()
{
  // Arrange
  uint8_t msg[] = {0x30, 0x33, 0x35, 0x30, 0x34};
  uint8_t encoded[6];

  // Act
  CobsEncoder::pack(msg, 5, encoded);

  // Assert
  return encoded[0] == 6 && encoded[5] == 0x34;
}

boolean CobsEncoder::test_unpack_2()
{
  // Arrange
  uint8_t encoded[] = {1, 2, 0x1};
  uint8_t decoded[2];

  // Act
  CobsEncoder::unpack(encoded, 3, decoded);

  // Assert
  return decoded[0] == 0x0 && decoded[1] == 0x1;
}

boolean CobsEncoder::test_unpack_5()
{
  // Arrange
  uint8_t encoded[] = {6, 0x30, 0x33, 0x35, 0x30, 0x34};
  uint8_t decoded[5];

  // Act
  CobsEncoder::unpack(encoded, 6, decoded);

  // Assert
  return decoded[0] == 0x30 && decoded[4] == 0x34;
}
