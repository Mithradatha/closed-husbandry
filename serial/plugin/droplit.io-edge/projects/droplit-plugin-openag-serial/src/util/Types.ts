
/**** Frame ****/
export type Sequence = 0x0 | 0x1;
export type Delimeter = number;
// export type Delimeter = string | Buffer | number[];

/**** Pin ****/
export type Mode = 'Digital' | 'Analog';
export type Service = 'BinarySwitch' | 'DimmableSwitch';
export type Member = 'switch' | 'brightness';
export type Direction = 'Input' | 'Output';
