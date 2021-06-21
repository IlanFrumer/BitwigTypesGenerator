export const Header = `
  // This file is Auto generated 
  // Type definitions for Bitwig Studio's Control Surface API
  // Project: https://bitwig.com
  // Definitions by: Ilan Frumer <https://github.com/IlanFrumer>

`;

export const javaPolyfills = `
    type int = number
    type float = number
    type double = number
    type long = number
    type byte = number
    type UUID = string;
    type Runnable = Function

    interface Supplier<T> { get(): T };
    interface BooleanSupplier { getAsBoolean(): boolean };
    interface IntSupplier { getAsIn(): int };
    interface DoubleSupplier { getAsDouble(): double };
    interface Consumer<T> {
    accept(t: T): void;
    andThen(after: Consumer<T>): Consumer<T>;
    }
    type IntConsumer = Consumer<int>
    type DoubleConsumer = Consumer<double>
    type ByteBuffer = Buffer;
    class IOException extends Error {}
    class RuntimeException extends Error {}

`;

export const globalTypes = `
  type int = number

  // midi.js
  export function isNoteOff(status: int, data2: int): boolean;
  export function isNoteOff(status: int, data2: int): boolean;
  export function isNoteOn(status: int): boolean;
  export function isKeyPressure(status: int): boolean;
  export function isChannelController(status: int): boolean;
  export function isProgramChange(status: int): boolean;
  export function isChannelPressure(status: int): boolean;
  export function isPitchBend(status: int): boolean;
  export function isMTCQuarterFrame(status: int): boolean;
  export function isSongPositionPointer(status: int): boolean;
  export function isSongSelect(status: int): boolean;
  export function isTuneRequest(status: int): boolean;
  export function isTimingClock(status: int): boolean;
  export function isMIDIStart(status: int): boolean;
  export function isMIDIContinue(status: int): boolean;
  export function isMIDIStop(status: int): boolean;
  export function isActiveSensing(status: int): boolean;
  export function isSystemReset(status: int): boolean;
  export function MIDIChannel(status: int): int;
  export function pitchBendValue(data1: int, data2:int): int;
  export function sendMidi(status: int, data1: int, data2: int): void;
  export function sendSysex(data: string): void;
  export function sendNoteOn(channel: int, key: int, velocity: int): void;
  export function sendNoteOff(channel: int, key: int, velocity: int): void;
  export function sendKeyPressure(channel: int, key: int, pressure: int): void;
  export function sendChannelController(channel: int, controller: int, value: int): void
  export function sendProgramChange(channel: int, program: int): void;        
  export function sendChannelPressure(channel: int, pressure: int): void      
  export function sendPitchBend(channel: int, value: int): void;

  // sysex.js
  export function printSysex(data: string): void;
  export function uint8ToHex(x: int): string;
  export function uint7ToHex(x: int): string;
  export function asciiCharToHex(c: string): string;
  export function prettyHex(hex: string): string

  // utils.js
  export function uint7ToInt7(x: int): int;
  export function singMagnitudeToInt7(x: int): int;
  export function withinRange(val: number, low: number, high: number): boolean;
  export function initArray<T>(value: T, length: int): T[];
  export function initArray<T>(value: T, length: int): T[];
  export function areArraysEqual<T>(a: T[], b: T[]): boolean;
  export function dump(obj: any): void;
  
  // @todo types
  export function makeIndexedFunction(index: int, f: any): (value: any) => void
  export function addPageNamesObserver(device: Bitwig.Device, observer: any): void

  interface String {
    // sysex.js
    hexByteAt(byteIndex: int): string;
    toHex(len: int): string;
    cleanupHex(): string;
    matchesHexPattern(pattern: string): boolean;

    // utils.js
    forceLength(length: int, padding?: string): string;
    forceLengthCentered(length: int, padding?: string): string;
    beginsWith(other: string): boolean;
    repeat(n: number, d: string): string;
  }

  export const println: Bitwig.ControllerHost['println'];
  export const errorln: Bitwig.ControllerHost['errorln'];
  
  // expose globals
  export const host: Bitwig.ControllerHost;
  export const load: Bitwig.ControllerHost['load'];
  export const loadAPI: Bitwig.ControllerHost['loadAPI'];
`;
