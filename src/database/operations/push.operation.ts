import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import generateId from 'nanoid'
import { classToPlain } from "class-transformer";
import { Model } from "../model/model";
import { MetadataUtils } from '../datastore/metadata.utils';

/**
 * This operation **pushes** an object to the database.
 * 
 * #### Usage
 * 
 * See [[Datastore.push]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class PushOperation<T extends Model<T>> implements BaseOperation<T>{
  /** Object to push. */
  private _toAdd?: T;

  /** The datastore where the operation takes place. */
  private _store: Datastore<T>

  /**
   * @param store The datastore where the deletion operation takes place.
   */
  constructor(store: Datastore<T>) {
    this._store = store
  }

  /**
   * Sets the item to push into the database.
   * @param value An item to push.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(value: T): this {
    this._toAdd = value
    return this
  }

  /**
   * Runs the operation and pushes the item.
   * @returns Returns the item with `item.meta` field set.
   */
  public async run(): Promise<T> {
    if (this._toAdd) {
      this._toAdd.meta = MetadataUtils.getNewMetadata()
      return await this._store.adapter.put(this._toAdd)
    }
    else {
      throw Error('Nothing is being pushed.')
    }
  }
}
