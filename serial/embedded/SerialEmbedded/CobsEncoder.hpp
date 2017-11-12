
#ifndef __COBSENCODER_H__
#define __COBSENCODER_H__

#include "Arduino.h"

class CobsEncoder
{
public:
  CobsEncoder(const uint8_t);
  size_t pack(const uint8_t *, const size_t, uint8_t *);
  size_t unpack(const uint8_t *, const size_t, uint8_t *);

private:
  const uint8_t _delim;
};

#endif
