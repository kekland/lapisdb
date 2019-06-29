import { Model } from "../model/model";
import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";

/**
 * This operation **deletes** an object from the database.
 * 
 * #### Usage
 * 
 * See [[Datastore.delete]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class DeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  /** The datastore where the operation takes place. */
  private _store: Datastore<T>;

  /** Identifier of an object to delete. */
  private _id?: string;

  /**
   * @param store The datastore where the deletion operation takes place.
   * @param id Identifier of an object to delete.
   */
  constructor(store: Datastore<T>, id?: string) {
    this._store = store
    this._id = id
  }

  /**
   * Deletes this item if [[run]] or [[delete]] is called.
   * @param item An item to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(item: T) {
    if (item.meta) {
      this._id = item.meta.id
      return this
    }
    else {
      throw Error('Object\'s meta field is null')
    }
  }

  /**
   * Deletes item with this id if [[run]] or [[delete]] is called.
   * @param id Identifier of an item to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public id(id: string) {
    this._id = id
    return this
  }

  /**
   * Runs the deletion operation.
   */
  public async run() {
    await this.delete()
  }

  /**
   * Runs the deletion operation.
   * Same as [[run]]
   */
  public async delete() {
    if (this._id == null) {
      throw new Error('Invalid parameters for DeleteOperation.')
    }
    await this._store.methods.delete(this._id)
  }
}