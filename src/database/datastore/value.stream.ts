import { DatastoreStreamIteratorData } from "./datastore";

export class ValueStream {
  public _stream: NodeJS.ReadableStream;
  private _onData: (data: any) => void;
  private _middleware: (data: any) => boolean;
  private _onError: (err: any) => void;
  private _onClose: () => void;
  private _internalOnClose: () => void;
  private closed = false

  set onData(value: (data: any) => void) {
    this._onData = value
  }

  set onError(value: (err: any) => void) {
    this._onError = value
  }

  set onClose(value: () => void) {
    this._onClose = value
  }

  set middleware(value: (data: any) => boolean) {
    this._middleware = value
  }

  constructor(stream: NodeJS.ReadableStream) {
    this._stream = stream
    this._stream.on('data', (data: DatastoreStreamIteratorData) => {
      if (this._onData) {
        let passed = true
        let value = data.value
        if(this._middleware) {
          passed = this._middleware(value)
        }
        if(passed) {
          this._onData(value)
        }
      }
    })

    this._stream.on('close', () => {
      closed = true
      if (this._onClose) {
        this._onClose()
      }
      if(this._internalOnClose) {
        this._internalOnClose()
      }
    })
  }

  public untilEnd(): Promise<void> {
    return new Promise((resolve, reject) => {
      if(this.closed) {
        return
      }
      this._internalOnClose = () => {
        resolve()
      }
    })
  }
}