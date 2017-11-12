
#include "Arduino.h";
#include "FletcherChecksum.hpp";

size_t FletcherChecksum::generate(uint8_t *src, size_t sz)
{
  size_t sum0 = 0;
  size_t sum1 = 0;

  for (size_t i = 0; i < sz; i++)
  {
    sum0 += src[i];
    if (sum0 >= 255)
    {
      sum0 -= 255;
    }
    sum1 += sum0;
    if (sum0 >= 255)
    {
      sum0 -= 255;
    }
  }

  const uint8_t chk0 = 255 - ((sum0 + sum1) % 255);
  const uint8_t chk1 = 255 - ((sum0 + chk0) % 255);

  src[sz++] = chk0;
  src[sz++] = chk1;

  return sz;
}

boolean FletcherChecksum::validate(uint8_t *src, size_t sz)
{
  size_t fst = sz - 2;
  size_t snd = sz - 1;

  const uint8_t chk0 = src[fst];
  const uint8_t chk1 = src[snd];

  generate(src, fst);

  return (chk0 == src[fst] && chk1 == src[snd]);
}
