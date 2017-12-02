
#ifndef __BINARYSWITCH_H__
#define __BINARYSWITCH_H__

#include "Arduino.h"

enum SwitchState
{
  OFF,
  ON
};

class BinarySwitch
{
public:
  BinarySwitch(const int);
  SwitchState getSwitch();
  uint8_t readSwitch();
  boolean switchOn();
  boolean switchOff();
  String toString();

private:
  int _pin;
  SwitchState _switch;

  boolean setSwitch(const SwitchState);
};

#endif
