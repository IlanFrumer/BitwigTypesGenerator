export const namespace = "Bitwig";

export const Header = `
// This file is Auto generated 
// Type definitions for Bitwig Studio's Control Surface API
// Project: https://bitwig.com
// Definitions by: Ilan Frumer <https://github.com/IlanFrumer>
`;

export const JavaPolyfills = `
// Java Polyfills
type int = number;
type float = number;
type double = number;
type long = number;
type byte = number;
type UUID = string;
type Runnable = Function;
type Class = Function;
type Method = Function;
type Func<R,T> = (val: T) => R;
type List<T> = Array<T>;
type Integer = Number;
type Long = Number;
type Float = Number;
type Double = Number;
type ByteBuffer = Buffer;

interface Supplier<T> { get(): T }
class IOException extends Error {}
class RuntimeException extends Error {}
interface Supplier<T> { get(): T }
interface BooleanSupplier { getAsBoolean(): boolean }
interface IntSupplier { getAsIn(): number }
interface DoubleSupplier { getAsDouble(): double }
interface Consumer<T> { accept(t: T): void; andThen(after: Consumer<T>): Consumer<T>; }
type IntConsumer = Consumer<int>
type DoubleConsumer = Consumer<double>
`;

export const Exports = `
  // midi.js
  export function isNoteOff(status: number, data2: number): boolean;
  export function isNoteOff(status: number, data2: number): boolean;
  export function isNoteOn(status: number): boolean;
  export function isKeyPressure(status: number): boolean;
  export function isChannelController(status: number): boolean;
  export function isProgramChange(status: number): boolean;
  export function isChannelPressure(status: number): boolean;
  export function isPitchBend(status: number): boolean;
  export function isMTCQuarterFrame(status: number): boolean;
  export function isSongPositionPointer(status: number): boolean;
  export function isSongSelect(status: number): boolean;
  export function isTuneRequest(status: number): boolean;
  export function isTimingClock(status: number): boolean;
  export function isMIDIStart(status: number): boolean;
  export function isMIDIContinue(status: number): boolean;
  export function isMIDIStop(status: number): boolean;
  export function isActiveSensing(status: number): boolean;
  export function isSystemReset(status: number): boolean;
  export function MIDIChannel(status: number): number;
  export function pitchBendValue(data1: number, data2:number): number;
  export function sendMidi(status: number, data1: number, data2: number): void;
  export function sendSysex(data: string): void;
  export function sendNoteOn(channel: number, key: number, velocity: number): void;
  export function sendNoteOff(channel: number, key: number, velocity: number): void;
  export function sendKeyPressure(channel: number, key: number, pressure: number): void;
  export function sendChannelController(channel: number, controller: number, value: number): void
  export function sendProgramChange(channel: number, program: number): void;        
  export function sendChannelPressure(channel: number, pressure: number): void      
  export function sendPitchBend(channel: number, value: number): void;

  // sysex.js
  export function printSysex(data: string): void;
  export function uint8ToHex(x: number): string;
  export function uint7ToHex(x: number): string;
  export function asciiCharToHex(c: string): string;
  export function prettyHex(hex: string): string

  // utils.js
  export function uint7ToInt7(x: number): number;
  export function singMagnitudeToInt7(x: number): number;
  export function withinRange(val: number, low: number, high: number): boolean;
  export function initArray<T>(value: T, length: number): T[];
  export function initArray<T>(value: T, length: number): T[];
  export function areArraysEqual<T>(a: T[], b: T[]): boolean;
  export function dump(obj: any): void;
  
  export function makeIndexedFunction(index: number, f: Function): (value: any) => void
  export function addPageNamesObserver(device: Bitwig.Device, observer: Function): void

  interface String {
    // sysex.js
    hexByteAt(byteIndex: number): string;
    toHex(len: number): string;
    cleanupHex(): string;
    matchesHexPattern(pattern: string): boolean;

    // utils.js
    forceLength(length: number, padding?: string): string;
    forceLengthCentered(length: number, padding?: string): string;
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
