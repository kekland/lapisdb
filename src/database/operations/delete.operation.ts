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

/**
 * This operation **deletes** a list of objects from the database.
 * 
 * #### Usage
 * 
 * See [[deleteBatched]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class BatchedDeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  /** The datastore where the operation takes place. */
  private _store: Datastore<T>;

  /** Identifiers of objects to delete. */
  private _identifiers: string[] = [];

  /**
   * @param store The datastore where the deletion operation takes place.
   */
  constructor(store: Datastore<T>) {
    this._store = store
  }

  /**
   * Add a single item to the deletion list.
   * @param item An item to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(item: T) {
    if (item.meta) {
      this.id(item.meta.id)
      return this
    }
    else {
      throw Error('Object\'s meta field is null')
    }
  }

  /**
   * Add an array of items to the deletion list.
   * @param items Array of items to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public items(items: T[]) {
    items.forEach(item => this.item(item))
    return this
  }

  /**
   * Add the identifier of a single object to the deletion list.
   * @param id Identifier of an object to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public id(id: string) {
    this._identifiers.push(id)
    return this
  }

  /**
   * Add an array of identifiers to the deletion list.
   * @param ids Array of identifiers to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public ids(ids: string[]) {
    ids.forEach(id => this.id(id))
    return this
  }

  /**
   * Add an array of identifiers to the deletion list.
   * Same as [[ids]].
   * @param ids Array of identifiers to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public identifiers(ids: string[]) {
    ids.forEach(id => this.id(id))
    return this
  }

  /**
   * Runs the operation. Deletes all the objects from the list.
   * @throws If one of the identifiers does not exist or something happened with the database.
   */
  public async run() {
    await this.delete()
  }

  /**
   * Same as [[run]].
   * @throws If one of the identifiers does not exist or something happened with the database.
   */
  public async delete() {
    const chain = this._store.methods.store.batch()
    for (const identifier of this._identifiers) {
      chain.del(identifier)
    }
    await chain.write()
  }
}