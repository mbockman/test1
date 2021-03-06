export const Seek = {
  Set: 0,
  Cur: 1
};

export const Endian = {
  Little: 0,
  Big: 1
};

class Stream {
  public static readonly Seek = Seek;
  public static readonly Endian = Endian;

  public endianess: number = Stream.Endian.Big;
  protected _offset = 0;

  get littleEndian() {
    return this.endianess === Stream.Endian.Little;
  }

  get offset() {
    return this._offset;
  }

  seek(offset: number, mode: number = Stream.Seek.Cur) {
    switch (mode) {
      case Stream.Seek.Set:
        this._offset = offset;
        break;
      case Stream.Seek.Cur:
        this._offset += offset;
        break;
    }
  }
}

export default Stream;
