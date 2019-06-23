import { DatastoreStreamIteratorData } from "./datastore";
import { IObjectFields } from "../types/typings";

export class ValueStream<T> {
  public _stream: NodeJS.ReadableStream;
  private _onData?: (data: any) => void;
  private _middleware?: (data: any) => boolean;
  private _onError?: (err: any) => void;
  private _onClose?: () => void;
  private _internalOnClose?: () => void;
  private closed = false

  set onData(value: (data: IObjectFields<T>) => void) {
    this._onData = value
  }

  set onError(value: (err: any) => void) {
    this._onError = value
  }

  set onClose(value: () => void) {
    this._onClose = value
  }

  set middleware(value: (data: IObjectFields<T>) => boolean) {
    this._middleware = value
  }

  constructor(stream: NodeJS.ReadableStream) {
    this._stream = stream
    this._stream.on('data', (data: IObjectFields<T>) => {
      if (this._onData) {
        let passed = true
        if(this._middleware) {
          passed = this._middleware(data)
        }
        if(passed) {
          this._onData(data)
        }
      }
    })

    this._stream.on('close', () => {
      this.closed = true
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