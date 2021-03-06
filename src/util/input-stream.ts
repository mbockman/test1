import Stream from './stream';

const DefaultEncoding = 'utf-8';

class InputStream extends Stream {
  private _arrayBuffer: ArrayBuffer | SharedArrayBuffer;
  private _dataView: DataView;

  constructor(data: ArrayBuffer | SharedArrayBuffer | string, endianess = Stream.Endian.Little) {
    super();

    this.endianess = endianess;
    this._arrayBuffer = this._makeArrayBuffer(data);
    this._dataView = new DataView(this._arrayBuffer);
  }

  get length() {
    return this._arrayBuffer.byteLength;
  }

  public isAtEnd() {
    return this.offset === this.length;
  }

  private _makeArrayBuffer(data: ArrayBuffer | SharedArrayBuffer | string): ArrayBuffer | SharedArrayBuffer {
    if (typeof data === 'string') {
      const binaryString = atob(data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    }

    return data;
  }

  getCharacter(): string {
    return String.fromCharCode(this.getUint8());
  }

  getUint8(): number {
    const result = this._dataView.getUint8(this._offset);
    this._offset += Uint8Array.BYTES_PER_ELEMENT;
    return result;
  }

  getUint16(): number {
    const result = this._dataView.getUint16(this._offset, this.littleEndian);
    this._offset += Uint16Array.BYTES_PER_ELEMENT;
    return result;
  }

  getUint24(): number {
    let result: number;
    if (this.littleEndian) {
      result =
        this._dataView.getUint16(this._offset, this.littleEndian) + (this._dataView.getUint8(this._offset) << 16);
    } else {
      result =
        (this._dataView.getUint16(this._offset, this.littleEndian) << 8) + this._dataView.getUint8(this._offset + 2);
    }
    this._offset += 3;
    return result;
  }

  getUint32(): number {
    const result = this._dataView.getUint32(this._offset, this.littleEndian);
    this._offset += Uint32Array.BYTES_PER_ELEMENT;
    return result;
  }

  getInt8(): number {
    const result = this._dataView.getInt8(this._offset);
    this._offset += Uint8Array.BYTES_PER_ELEMENT;
    return result;
  }

  getInt16(): number {
    const result = this._dataView.getInt16(this._offset, this.littleEndian);
    this._offset += Uint16Array.BYTES_PER_ELEMENT;
    return result;
  }

  getInt32(): number {
    const result = this._dataView.getInt32(this._offset, this.littleEndian);
    this._offset += Uint32Array.BYTES_PER_ELEMENT;
    return result;
  }

  getCharacters(length: number, encoding: string = DefaultEncoding): string {
    if (length === 0) {
      return '';
    }

    const data = new Uint8Array(this._arrayBuffer, this._offset, length);
    this._offset += length;

    const decoder = new TextDecoder(encoding);
    return decoder.decode(data);
  }

  getCStringWithLength(fixedLength: number, encoding: string = DefaultEncoding): string {
    const raw = this.getUint8Array(fixedLength);
    let length = 0;
    while (length < raw.length && raw[length] !== 0) {
      length++;
    }

    const decoder = new TextDecoder(encoding);
    return decoder.decode(raw.slice(0, length));
  }

  getNullTerminatedString(maxLength: number, encoding: string = DefaultEncoding): string {
    const uint8Array = new Uint8Array(this._arrayBuffer, this._offset, maxLength);

    let length = -1;
    while (uint8Array[++length]) {
      true /* nop */;
    }

    return this.getCharacters(length, encoding);
  }

  getLengthPrefixedString(encoding: string = DefaultEncoding): string {
    const length = this.getUint16();
    return this.getCharacters(length, encoding);
  }

  getPascalString(encoding: string = DefaultEncoding): string {
    const length = this.getUint8();
    return this.getCharacters(length, encoding);
  }

  getUint8Array(length: number): Uint8Array {
    const result = new Uint8Array(this._arrayBuffer, this._offset, length);
    this._offset += length;
    return result;
  }

  getUint16Array(length: number): Uint16Array {
    let result: Uint16Array;

    if (this._offset % 2 !== 0) {
      const buffer = this._arrayBuffer.slice(this._offset, this._offset + length * 2);
      result = new Uint16Array(buffer);
    } else {
      result = new Uint16Array(this._arrayBuffer, this._offset, length);
    }

    this._offset += length * 2;
    return result;
  }

  getInt16Array(length: number): Int16Array {
    let result: Int16Array;

    if (this._offset % 2 !== 0) {
      const buffer = this._arrayBuffer.slice(this._offset, this._offset + length * 2);
      result = new Int16Array(buffer);
    } else {
      result = new Int16Array(this._arrayBuffer, this._offset, length);
    }

    this._offset += length * 2;
    return result;
  }

  getUint32Array(length: number): Uint32Array {
    let result: Uint32Array;

    if (this._offset % 4 !== 0) {
      const buffer = this._arrayBuffer.slice(this._offset, this._offset + length * 4);
      result = new Uint32Array(buffer);
    } else {
      result = new Uint32Array(this._arrayBuffer, this._offset, length);
    }

    this._offset += length * 4;
    return result;
  }

  getInt32Array(length: number): Int32Array {
    let result: Int32Array;

    if (this._offset % 4 !== 0) {
      const buffer = this._arrayBuffer.slice(this._offset, this._offset + length * 4);
      result = new Int32Array(buffer);
    } else {
      result = new Int32Array(this._arrayBuffer, this._offset, length);
    }

    this._offset += length * 4;
    return result;
  }
}

export default InputStream;
