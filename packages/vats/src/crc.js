/*
 * https://en.wikipedia.org/wiki/Cyclic_redundancy_check
 * Copyright (c) 2018 Vladimir Latyshev
 * License: MIT
 * Algorithms ported from https://pycrc.org/
 * Forked from npm polycrc@1.1.0 for module system compatibility, then trimmed
 * down to a version that assumes TypedArrays are universal.
 */
// @ts-check
/* eslint-disable no-bitwise */

/** @typedef {string | number | Uint8Array | ArrayBuffer} Data */

const encoder = new TextEncoder();

/** @param {Data} data */
function convert(data) {
  if (typeof data === 'number') {
    const bytes = [];
    // For compatibility with polycrc@1.0.0, we make it at least 4 bytes in length.
    // If we have a number more than 32 bits, we will have more bytes already.
    while (data > 0 || bytes.length < 4) {
      bytes.unshift(data % 256);
      data = Math.floor(data / 256);
    }
    return new Uint8Array(bytes);
  } else if (typeof data === 'string') {
    return encoder.encode(data);
  } else if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  throw new TypeError(
    `crc requires 32 bit number, a string or TypedArray for input`,
  );
}

/**
 * @param {number} data
 * @param {number} width
 */
function mirror(data, width) {
  let res = 0;
  for (let i = 0; i < width; i += 1) {
    res = (res << 1) | (data & 1);
    data >>= 1;
  }
  return res;
}

export class CRC {
  /**
   * @param {number} width
   * @param {number} poly
   * @param {number} xorIn
   * @param {number} xorOut
   * @param {boolean} reflect
   */
  constructor(width, poly, xorIn, xorOut, reflect) {
    this.width = width;
    this.poly = poly;
    this.xorIn = xorIn;
    this.reflectedXorIn = mirror(xorIn, width);
    this.xorOut = xorOut;
    this.reflect = reflect;
    this.msbMask = 1 << (this.width - 1);
    this.mask = ((this.msbMask - 1) << 1) | 1;
    this.crcShift = this.width < 8 ? 8 - this.width : 0;
    this.shiftedXorIn = this.xorIn << this.crcShift;

    const table = this.genTable();
    this.table = table;

    if (this.width === 8 && !this.xorIn && !this.xorOut && !this.reflect) {
      /** @param {Data} data */
      this.calculate = function calculate(data) {
        const buffer = convert(data);
        let crc = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          crc = table[crc ^ buffer[i]];
        }
        return crc;
      };
    }
  }

  /** @param {Data} data */
  calculate(data) {
    const buffer = convert(data);
    let crc;
    const { table, width, crcShift, mask } = this;
    if (this.reflect) {
      crc = this.reflectedXorIn;
      for (let i = 0; i < buffer.length; i += 1) {
        const byte = buffer[i];
        crc = (table[(crc ^ byte) & 0xff] ^ (crc >>> 8)) & mask;
      }
    } else {
      crc = this.shiftedXorIn;
      for (let i = 0; i < buffer.length; i += 1) {
        crc =
          (table[((crc >> (width - 8 + crcShift)) ^ buffer[i]) & 0xff] <<
            crcShift) ^
          ((crc << (8 - crcShift)) & (mask << crcShift));
      }
      crc >>= crcShift;
    }
    crc ^= this.xorOut;
    return crc >>> 0;
  }

  /** @param {Data} data */
  calculateNoTable(data) {
    const buffer = convert(data);
    let crc = this.xorIn;
    for (let i = 0; i < buffer.length; i += 1) {
      let octet = buffer[i];
      if (this.reflect) octet = mirror(octet, 8);
      for (let j = 0; j < 8; j += 1) {
        let topbit = crc & this.msbMask;
        if (octet & (0x80 >> j)) topbit ^= this.msbMask;
        crc <<= 1;
        if (topbit) crc ^= this.poly;
      }
      crc &= this.mask;
    }
    if (this.reflect) crc = mirror(crc, this.width);
    crc ^= this.xorOut;
    return crc >>> 0;
  }

  genTable() {
    const tableLength = 256;
    const table = [];
    for (let i = 0; i < tableLength; i += 1) {
      let reg = i;
      if (this.reflect) reg = mirror(reg, 8);
      reg <<= this.width - 8 + this.crcShift;
      for (let j = 0; j < 8; j += 1) {
        if ((reg & (this.msbMask << this.crcShift)) !== 0) {
          reg <<= 1;
          reg ^= this.poly << this.crcShift;
        } else {
          reg <<= 1;
        }
      }
      if (this.reflect)
        reg = mirror(reg >> this.crcShift, this.width) << this.crcShift;
      reg = (reg >> this.crcShift) & this.mask;
      table[i] = reg >>> 0;
    }
    return new Int32Array(table);
  }
}

export const crc1 = new CRC(1, 0x01, 0x00, 0x00, false);
export const crc6 = new CRC(6, 0x2f, 0x00, 0x00, false);
export const crc8 = new CRC(8, 0x07, 0x00, 0x00, false);
export const crc10 = new CRC(10, 0x233, 0x0000, 0x0000, false);
export const crc16 = new CRC(16, 0x8005, 0x0000, 0x0000, true);
export const crc24 = new CRC(24, 0x864cfb, 0xb704ce, 0x000000, false);
export const crc32 = new CRC(32, 0x04c11db7, 0xffffffff, 0xffffffff, true);
export const crc32c = new CRC(32, 0x1edc6f41, 0xffffffff, 0xffffffff, true);

export const models = { crc1, crc6, crc8, crc10, crc16, crc24, crc32, crc32c };
