
#ifndef __FLETCHERCHECKSUM_H__
#define __FLETCHERCHECKSUM_H__

#include "Arduino.h"

// This really should be a namespace
class FletcherChecksum
{
public:
  static size_t generate(uint8_t *, size_t);
  static boolean validate(uint8_t *, size_t);
};

#endif
