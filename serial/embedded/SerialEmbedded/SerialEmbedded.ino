
#include "BinarySwitch.h"
#include "FletcherChecksum.h"
#include "CobsEncoder.h"

const uint8_t delimiter = 0x0;
const size_t buf_sz = 256;
unsigned long baud_rt = 9600;

uint8_t recv[buf_sz];
size_t recvx = 0;

BinarySwitch led(13);
CobsEncoder encoder(delimiter);

void setup()
{
  led.switchOff();
  Serial.begin(baud_rt);

  test_FletcherChecksum();
  test_CobsEncoder();
}

void loop()
{
  //  while (Serial.available() > 0)
  //  {
  //    const uint8_t token = Serial.read();
  //
  //    if (token == delimiter)
  //    {
  //      uint8_t decoded[recvx];
  //      const size_t sz = encoder.unpack(recv, recvx, decoded);
  //      onData(decoded, sz);
  //      recvx = 0;
  //    }
  //    else if (recvx + 1 < buf_sz)
  //    {
  //      recv[recvx++] = token;
  //    }
  //    else
  //    {
  //    }
  //  }
}

void onData(const uint8_t *buf, const size_t sz)
{
  const uint8_t cmd = buf[0];

  switch (cmd)
  {
  case 0x30:
    printState(led.switchOff());
    break;
  case 0x31:
    printState(led.switchOn());
    break;
  default:
    Serial.println("Unknown Command");
  }
}

void printState(const boolean change)
{
  String currentState = led.toString();
  Serial.println((change) ? "Changed: " + currentState : "Unchanged: " + currentState);
}

void printArray(const uint8_t *arr, const size_t sz)
{
  Serial.print("[ ");

  for (size_t i = 0; i < sz - 1; i++)
  {
    Serial.print(arr[i]);
    Serial.print(", ");
  }

  Serial.print(arr[sz - 1]);
  Serial.println(" ]");
}

void test(const char *file, const char *func, const boolean val)
{
  Serial.print((val) ? "Passed: " : "Failed: ");
  Serial.print(func);
  Serial.print(" (");
  Serial.print(file);
  Serial.println(")");
}

void test_FletcherChecksum()
{
  test("FletcherChecksum", "test_generate_2", FletcherChecksum::test_generate_2());
  test("FletcherChecksum", "test_generate_5", FletcherChecksum::test_generate_5());
  test("FletcherChecksum", "test_generate_6", FletcherChecksum::test_generate_6());
  test("FletcherChecksum", "test_generate_8", FletcherChecksum::test_generate_8());
  test("FletcherChecksum", "test_append_2", FletcherChecksum::test_append_2());
  test("FletcherChecksum", "test_valid_2", FletcherChecksum::test_valid_2());
}

void test_CobsEncoder()
{
  test("CobsEncoder", "test_pack_2", encoder.test_pack_2());
  test("CobsEncoder", "test_pack_5", encoder.test_pack_5());
  test("CobsEncoder", "test_unpack_2", encoder.test_unpack_2());
  test("CobsEncoder", "test_unpack_5", encoder.test_unpack_5());
}
