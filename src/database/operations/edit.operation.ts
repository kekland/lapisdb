import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import { IEdit } from "../types/edit.types";
import { Model } from "../model/model";

export class EditOperation<T extends Model<T>> implements BaseOperation<T> {
  private _store: Datastore<T>;
  private _id: string;
  private _item: T;
  private _data: IEdit<T>;

  public async run() {
    await this.edit()
  }

  constructor(store: Datastore<T>, id?: string, item?: T) {
    this._store = store
    this._id = id
    this._item = item
  }

  public item(item: T) {
    this._item = item
  }

  public id(id: string) {
    this._id = id
  }

  public with(data: IEdit<T>) {
    this._data = data
  }

  public async edit() {
    if (this._item == null) {
      if (this._id == null) {
        throw new Error('Invalid parameters for EditOperation.')
      }
      this._item = await this._store.methods.getOne(this._id)
    }
    
    if(this._data == null) {
      throw new Error('Invalid parameters for EditOperation.')
    }

    for(const key in this._data) {
      if(this._data[key] != null && key != 'meta' && key != 'db') {
        this._item[key] = this._data[key]
      }
    }

    this._store.methods.put(this._item.meta.id, this._item)
  }
}