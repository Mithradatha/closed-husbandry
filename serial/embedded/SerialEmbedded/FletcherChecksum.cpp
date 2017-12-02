
#include "FletcherChecksum.h";

/**
 * https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 * 
 * 8-bit implementation (16-bit checksum)
 * 
 * This implementation was not written with optimization
 * in mind. There are ways to optimize this code if needed
*/

namespace FletcherChecksum
{
uint16_t generate(const uint8_t *src, const size_t sz)
{
  uint16_t sum0 = 0;
  uint16_t sum1 = 0;

  for (size_t i = 0; i < sz; i++)
  {
    sum0 = (sum0 + src[i]) % 255;
    sum1 = (sum1 + sum0) % 255;
  }

  return (sum1 << 8) | sum0;
}

void append(uint8_t *src, size_t sz, uint16_t sum)
{
  const uint8_t sum0 = sum & 255;
  const uint8_t sum1 = (sum >> 8) & 255;

  const uint8_t chk0 = 255 - ((sum0 + sum1) % 255);
  const uint8_t chk1 = 255 - ((sum0 + chk0) % 255);

  const size_t fst = sz - 2;
  const size_t lst = sz - 1;

  src[fst] = chk0;
  src[lst] = chk1;
}

boolean valid(const uint8_t *src, const size_t sz)
{
  return generate(src, sz) == 0;
}

//======================================
// Tests
//======================================

boolean test_generate_2()
{
  // Arrange
  const uint8_t msg[] = {0x01, 0x02};

  // Act
  const uint16_t sum = generate(msg, 2);

  // Assert
  const boolean pass = sum == 0x0403;

  return pass;
}

boolean test_generate_5()
{
  // Arrange
  const uint8_t msg[] = "abcde";

  // Act
  const uint16_t sum = generate(msg, 5);

  // Assert
  const boolean pass = sum == 0xC8F0;

  return pass;
}

boolean test_generate_6()
{
  // Arrange
  const uint8_t msg[] = "abcdef";

  // Act
  const uint16_t sum = generate(msg, 6);

  // Assert
  const boolean pass = sum == 0x2057;

  return pass;
}

boolean test_generate_8()
{
  // Arrange
  const uint8_t msg[] = "abcdefgh";

  // Act
  const uint16_t sum = generate(msg, 8);

  // Assert
  const boolean pass = sum == 0x0627;

  return pass;
}

boolean test_append_2()
{
  // Arrange
  const uint16_t sum = 0x0403;

  uint8_t msg[4];
  msg[0] = 0x01;
  msg[1] = 0x02;

  // Act
  append(msg, 4, sum);

  // Assert
  return msg[2] == 0xF8 && msg[3] == 0x04;
}

boolean test_valid_2()
{
  // Arrange
  uint8_t msg[] = {0x01, 0x02, 0xF8, 0x04};

  // Act
  const boolean isValid = valid(msg, 4);

  // Assert
  return isValid;
}
};
