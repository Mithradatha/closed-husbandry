
#include "FletcherChecksum.h"
#include "CobsEncoder.h"

const uint8_t delimiter = 0x0;
const unsigned long baud_rt = 9600;
const size_t buf_sz = 256;

uint8_t recv[buf_sz];
size_t recvx = 0;

uint8_t sequence = 0x1;
CobsEncoder encoder(delimiter);

void setup()
{
  pinMode(13, OUTPUT);
  digitalWrite(13, LOW);
  Serial.begin(baud_rt);
}

void deliver(const uint8_t *src, const size_t sz)
{
  // msglen = src + fletcher checksum
  const size_t msglen = sz + 2;
  uint8_t msg[msglen];

  for (size_t i = 0; i < sz; i++)
  {
    msg[i] = src[i];
  }

  const uint16_t sum = FletcherChecksum::generate(msg, sz);
  FletcherChecksum::append(msg, msglen, sum);

  // encodedlen = msg + cobs encoding + delimiter
  const size_t encodedlen = msglen + 2;
  uint8_t encoded[encodedlen];

  encoder.pack(msg, msglen, encoded);
  encoded[encodedlen - 1] = delimiter;

  Serial.write(encoded, encodedlen);
}

void retrieve()
{
  uint8_t decoded[recvx];
  const size_t sz = encoder.unpack(recv, recvx, decoded);

  recvx = 0;

  if (FletcherChecksum::valid(decoded, sz))
  {
    const size_t requestlen = sz - 2;
    uint8_t request[requestlen];

    FletcherChecksum::strip(decoded, sz, request);
    if (sequence != request[0])
    {
      execute(request, requestlen);
    }
  }
}

void loop()
{
  while (Serial.available() > 0)
  {
    const uint8_t token = Serial.read();

    if (token == delimiter)
    {
      retrieve();
    }
    else if (recvx + 1 < buf_sz)
    {
      recv[recvx++] = token;
    }
    else
    {
      // overflow
    }
  }
}

void execute(const uint8_t *buf, const size_t sz)
{
  if (sz > 2)
  {
    const uint8_t seq = buf[0];
    const uint8_t pin = buf[1];
    const uint8_t cmd = buf[2];

    uint8_t response[3];
    response[0] = seq;

    sequence = seq;
    size_t responselen;

    switch (cmd)
    {
      case 0x0: // Digital Read
      {
        //pinMode(pin, INPUT);
        responselen = 2;
        response[1] = digitalRead(pin);
        break;
      }
      case 0x1: // Digital Write
      {
        //pinMode(pin, OUTPUT);
        responselen = 1;
        const uint8_t dVal = (buf[3] == 0x0) ? LOW : HIGH;
        digitalWrite(pin, dVal);
        break;
      }
      case 0x2: // Analog Read
      {
        //pinMode(pin, INPUT);
        responselen = 3;
        uint8_t aVal = analogRead(pin);
        response[1] = aVal & 0xFF;
        response[2] = (aVal >> 8) & 0xFF;
        break;
      }
      case 0x3: // Analog Write
      {
        //pinMode(pin, OUTPUT);
        responselen = 1;
        analogWrite(pin, buf[3]);
        break;
      }
    }
    
    deliver(response, responselen);
  }
}

