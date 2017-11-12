
#include "Arduino.h"
#include "CobsEncoder.hpp"

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
