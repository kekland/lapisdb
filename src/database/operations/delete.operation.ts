import { Model } from "../model/model";
import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";

export class DeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  private _store: Datastore<T>;
  private _id: string;

  public async run() {
    await this.delete()
  }

  constructor(store: Datastore<T>, id?: string) {
    this._store = store
    this._id = id
  }

  public item(item: T) {
    this._id = item.meta.id
  }

  public id(id: string) {
    this._id = id
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

  public async run() {
    await this.delete()
  }

  constructor(store: Datastore<T>) {
    this._store = store
  }

  public item(item: T) {
    this.id(item.meta.id)
  }

  public items(items: T[]) {
    items.forEach(item => this.item(item))
  }

  public id(id: string) {
    this._identifiers.push(id)
  }
  
  public ids(ids: string[]) {
    ids.forEach(id => this.id(id))
  }

  public identifiers(ids: string[]) {
    ids.forEach(id => this.id(id))
  }

  public async delete() {
    const chain = this._store.methods.store.batch()
    for(const identifier of this._identifiers) {
      chain.del(identifier)
    }
    await chain.write()
  }
}