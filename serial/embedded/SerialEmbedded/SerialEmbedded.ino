
#include "FletcherChecksum.h"
#include "CobsEncoder.h"

// Constants
const uint8_t DELIMITER = 0x0;
const unsigned long BAUD_RATE = 9600;
const size_t BUFFER_SIZE = 256;

// Request Buffer
uint8_t recv[BUFFER_SIZE];
size_t recvx = 0;

uint8_t sequence = 0x0;
CobsEncoder encoder(DELIMITER);

void setup()
{
  // pinMode(13, OUTPUT);
  Serial.begin(BAUD_RATE);

  // 01 06 04 0d 01 c6 27 00
  //  recv[recvx++] = 0x01;
  //  recv[recvx++] = 0x06;
  //  recv[recvx++] = 0x04;
  //  recv[recvx++] = 0x0d;
  //  recv[recvx++] = 0x01;
  //  recv[recvx++] = 0xc6;
  //  recv[recvx++] = 0x27;
  //  retrieve();

  //  const size_t encodedlen = 6;
  //  uint8_t encoded[encodedlen];
  //  encoded[0] = 0x01;
  //  encoded[1] = 0x04;
  //  encoded[2] = 0x04;
  //  encoded[3] = 0xF7;
  //  encoded[4] = 0x04;
  //  encoded[5] = 0x00;
  //  Serial.write(encoded, encodedlen);
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

  // encodedlen = msg + cobs encoding + DELIMITER
  const size_t encodedlen = msglen + 2;
  uint8_t encoded[encodedlen];

  encoder.pack(msg, msglen, encoded);
  encoded[encodedlen - 1] = DELIMITER;

  printArray(encoded, encodedlen);
  Serial.write(encoded, encodedlen);
}

void retrieve()
{
  uint8_t decoded[recvx];
  printArray(recv, recvx);
  const size_t sz = encoder.unpack(recv, recvx, decoded);
  printArray(decoded, sz);
  recvx = 0;

  if (FletcherChecksum::valid(decoded, sz))
  {
    // // Serial.println("Valid");
    const size_t requestlen = sz - 2;
    uint8_t request[requestlen];

    FletcherChecksum::strip(decoded, sz, request);
    printArray(decoded, requestlen);

    if (sequence == request[0])
    {
      // // Serial.println("Correct Sequence");
      printArray(request, requestlen);
      execute(request, requestlen);
    }
  }
}

void loop()
{
//  const size_t responselen = 2;
//  uint8_t response[responselen];
//  response[0] = sequence;
//  response[1] = 0x4;
//  deliver(response, responselen);
//  delay(1000);


      while (Serial.available() > 0)
      {
        const uint8_t token = Serial.read();
  
        if (token == DELIMITER)
        {
          retrieve();
        }
        else if (recvx + 1 < BUFFER_SIZE)
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
  const uint8_t seq = buf[0];
  const uint8_t cmd = buf[1];

  printArray(&seq, 1);
  printArray(&cmd, 1);

  switch (cmd)
  {
    case 0x0: // Digital Read
      {
        const uint8_t pin = buf[2];
        const size_t responselen = 3;
        uint8_t response[responselen];
        response[0] = seq;
        response[1] = cmd;
        response[2] = digitalRead(pin);
        deliver(response, responselen);
        break;
      }
    case 0x1: // Digital Write
      {
        const uint8_t pin = buf[2];
        const uint8_t val = buf[3];
        const size_t responselen = 2;
        uint8_t response[responselen];
        response[0] = seq;
        response[1] = cmd;
        const uint8_t dVal = (val == 0x0) ? LOW : HIGH;
        digitalWrite(pin, dVal);
        deliver(response, responselen);
        break;
      }
    case 0x2: // Analog Read
      {
        const uint8_t pin = buf[2];
        const size_t responselen = 4;
        uint8_t response[responselen];
        response[0] = seq;
        response[1] = cmd;
        uint16_t aVal = analogRead(pin);
        response[2] = lowByte(aVal);
        response[3] = highByte(aVal);
        deliver(response, responselen);
        break;
      }
    case 0x3: // Analog Write
      {
        const uint8_t pin = buf[2];
        const uint8_t val = buf[3];
        const size_t responselen = 2;
        uint8_t response[responselen];
        response[0] = seq;
        response[1] = cmd;
        analogWrite(pin, val);
        deliver(response, responselen);
        break;
      }
    case 0x4: // Pin Direction
      {
        const uint8_t pin = buf[2];
        printArray(&pin, 1);
        const uint8_t val = buf[3];
        printArray(&val, 1);
        const size_t responselen = 2;
        uint8_t response[responselen];
        response[0] = seq;
        response[1] = cmd;
        const uint8_t pVal = (val == 0x0) ? INPUT : OUTPUT;
        printArray(&pVal, 1);
        pinMode(pin, pVal);
        deliver(response, responselen);
        break;
      }
    case 0x6: // Acknowledgement
      {
        const size_t responselen = 2;
        uint8_t response[responselen];
        response[0] = seq;
        response[1] = cmd;
        deliver(response, responselen);
        break;
      }
  }

  sequence = !seq;
}

void printArray(const uint8_t *buf, const size_t sz)
{
  // Serial.print("[");
  for (int i = 0; i < sz; i++)
  {
    // Serial.print(buf[i], HEX);
    // Serial.print(",");
  }
  // // Serial.println("]");
}

