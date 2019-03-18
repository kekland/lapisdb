import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import { IEdit } from "../types/edit.types";
import { Model } from "../model/model";

/**
 * This operation **edits** an object in the database.
 * 
 * #### Usage
 * 
 * See [[Datastore.edit]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class EditOperation<T extends Model<T>> implements BaseOperation<T> {
  /** The datastore where the operation takes place. */
  private _store: Datastore<T>;

  /** Identifier of an object to edit. Same as `_item.meta.id` */
  private _id: string;
  
  /** Object to edit. */
  private _item: T;
  
  /** Data fields to set on `_item`. */
  private _data: IEdit<T>;

  /**
   * @param store The datastore where the operation takes place.
   * @param id Identifier of an object to edit.
   * @param item Object to edit.
   */
  constructor(store: Datastore<T>, id?: string, item?: T) {
    this._store = store
    this._id = id
    this._item = item
  }

  /**
   * Edits the item passed as the argument.
   * @param item Object to edit.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(item: T) {
    this._item = item
    return this
  }

  /**
   * Edits the item with the identifier passed as the argument.
   * @param id Identifier of an object to edit.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public id(id: string) {
    this._id = id
    return this
  }

  /**
   * Edits the item with the fields passed as the argument.
   * 
   * All of `data`'s fields are optional, and all non-null fields in `_data` will 
   * replace the corresponding fields in `_item`.
   * @param data Identifier of an object to edit.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public with(data: IEdit<T>) {
    this._data = data
    return this
  }

  /**
   * Runs the editing operation.
   */
  public async run() {
    await this.edit()
  }
  
  /**
   * Runs the editing operation.
   * Same as [[run]]
   */
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