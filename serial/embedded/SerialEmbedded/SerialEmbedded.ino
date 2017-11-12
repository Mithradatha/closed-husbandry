
#include "BinarySwitch.hpp"
#include "FletcherChecksum.hpp"
#include "CobsEncoder.hpp"

const uint8_t delimiter = 0x0;
const size_t buf_sz = 255;
unsigned long baud_rt = 9600;

uint8_t recv[buf_sz];
size_t recvx = 0;

BinarySwitch led(13);
CobsEncoder encoder(delimiter);

void setup()
{
  led.switchOff();
  Serial.begin(baud_rt);
}

void loop()
{
  while (Serial.available() > 0)
  {
    const uint8_t token = Serial.read();

    if (token == delimiter)
    {
      uint8_t decoded[recvx];
      const size_t sz = encoder.unpack(recv, recvx, decoded);
      onData(decoded, sz);
      recvx = 0;
    }
    else if (recvx + 1 < buf_sz)
    {
      recv[recvx++] = token;
    }
    else
    {
    }
  }
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

void test()
{
  Serial.println(delimiter);

  uint8_t msg[] = {0x30, 0x33, 0x35, 0x30, 0x34};
  const size_t msg_len = 5;
  printArray(msg, msg_len);

  uint8_t encoded[msg_len + 1];
  encoder.pack(msg, msg_len, encoded);
  printArray(encoded, msg_len + 1);

  uint8_t decoded[msg_len];
  encoder.unpack(encoded, msg_len + 1, decoded);
  printArray(decoded, msg_len);
}
