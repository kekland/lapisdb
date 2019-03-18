import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import generateId from 'nanoid'
import { classToPlain } from "class-transformer";
import { Model } from "../model/model";

export class PushOperation<T extends Model<T>> implements BaseOperation<T>{ 
  private _toAdd: T;
  private _store: Datastore<T>

  constructor(store: Datastore<T>) {
    this._store = store
  }

  public item(value: T) {
    this._toAdd = value
    return this
  }

  public async run(): Promise<T> {
    return await this.push()
  }

  public async push(): Promise<T> {
    return await this._store.methods.push(this._toAdd)
  }
}

export class BatchedPushOperation<T extends Model<T>> implements BaseOperation<T> {
  private _toAdd: T[] = [];
  private _store: Datastore<T>

  constructor(store: Datastore<T>) {
    this._store = store
  }

  public item(value: T) {
    const id = generateId()
    this._store.methods.setPushData(id, value)
    this._toAdd.push(value)
    return this
  }

  public items(values: T[]) {
    values.forEach(value => this.item(value))
    return this
  }

  public async run(): Promise<T[]> {
    return await this.push()
  }

  public async push(): Promise<T[]> {
    const chain = this._store.methods.store.batch()
    for(const value of this._toAdd) {
      chain.put(value.meta.id, classToPlain(value))
    }
    await chain.write()
    return this._toAdd
  }
}