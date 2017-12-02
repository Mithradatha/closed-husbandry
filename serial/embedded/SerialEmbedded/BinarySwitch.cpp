
#include "BinarySwitch.h"

BinarySwitch::BinarySwitch(const int pin)
{
  _pin = pin;
  pinMode(_pin, OUTPUT);
}

SwitchState BinarySwitch::getSwitch()
{
  return _switch;
}

uint8_t BinarySwitch::readSwitch()
{
  return digitalRead(_pin);
}

boolean BinarySwitch::switchOn()
{
  return setSwitch(ON);
}

boolean BinarySwitch::switchOff()
{
  return setSwitch(OFF);
}

String BinarySwitch::toString()
{
  return (_switch == ON) ? "On" : "Off";
}

boolean BinarySwitch::setSwitch(const SwitchState val)
{
  if (_switch != val)
  {

    if (val == OFF)
    {
      digitalWrite(_pin, LOW);
      _switch = OFF;
    }
    else
    {
      digitalWrite(_pin, HIGH);
      _switch = ON;
    }

    return true;
  }
  else
  {
    return false;
  }
}
