import { Model } from "../model/model";
import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";

export class DeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  private _store: Datastore<T>;
  private _id: string;

  constructor(store: Datastore<T>, id?: string) {
    this._store = store
    this._id = id
  }

  public item(item: T) {
    this._id = item.meta.id
    return this
  }

  public id(id: string) {
    this._id = id
    return this
  }

  public async run() {
    await this.delete()
  }

  public async delete() {
    if (this._id == null) {
      throw new Error('Invalid parameters for DeleteOperation.')
    }
    await this._store.methods.delete(this._id)
  }
}

export class BatchedDeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  private _store: Datastore<T>;
  private _identifiers: string[] = [];

  constructor(store: Datastore<T>) {
    this._store = store
  }

  public item(item: T) {
    this.id(item.meta.id)
    return this
  }

  public items(items: T[]) {
    items.forEach(item => this.item(item))
    return this
  }

  public id(id: string) {
    this._identifiers.push(id)
    return this
  }
  
  public ids(ids: string[]) {
    ids.forEach(id => this.id(id))
    return this
  }

  public identifiers(ids: string[]) {
    ids.forEach(id => this.id(id))
    return this
  }

  public async run() {
    await this.delete()
  }

  public async delete() {
    const chain = this._store.methods.store.batch()
    for(const identifier of this._identifiers) {
      chain.del(identifier)
    }
    await chain.write()
  }
}