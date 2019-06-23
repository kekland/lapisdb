import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import generateId from 'nanoid'
import { classToPlain } from "class-transformer";
import { Model } from "../model/model";

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
  public item(value: T) {
    this._toAdd = value
    return this
  }

  /**
   * Runs the operation and pushes the item.
   * @returns Returns the item with `item.meta` field set.
   */
  public async run(): Promise<T> {
    return await this.push()
  }

  /**
   * Runs the operation and pushes the item.
   * 
   * Same as [[run]]
   * 
   * @returns Returns the item with `item.meta` field set.
   */
  public async push(): Promise<T> {
    if (this._toAdd) {
      return await this._store.methods.push(this._toAdd)
    }
    else {
      throw Error('Nothing is being pushed.')
    }
  }
}

/**
 * This operation **pushes** a list of objects to the database.
 * 
 * #### Usage
 * 
 * See [[Datastore.pushBatched]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class BatchedPushOperation<T extends Model<T>> implements BaseOperation<T> {
  /** The datastore where the operation takes place. */
  private _store: Datastore<T>

  /** Array of objects to push. */
  private _toAdd: T[] = []

  /**
   * @param store The datastore where the deletion operation takes place.
   */
  constructor(store: Datastore<T>) {
    this._store = store
  }

  /**
   * Add a single item to the list of items to push.
   * @param value An item to push.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(value: T) {
    const id = generateId()
    this._store.methods.setPushData(id, value)
    this._toAdd.push(value)
    return this
  }

  /**
   * Add an array of items to the list of items to push.
   * @param values A list of items to push.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public items(values: T[]) {
    values.forEach(value => this.item(value))
    return this
  }

  /**
   * Runs the operation and pushes all items from the list.
   * @returns Returns the array of pushed items.
   */
  public async run(): Promise<T[]> {
    return await this.push()
  }

  /**
   * Same as [[run]]
   * @returns Returns the array of pushed items.
   */
  public async push(): Promise<T[]> {
    const chain = this._store.methods.store.batch()
    for (const value of this._toAdd) {
      if (value.meta) {
        chain.put(value.meta.id, classToPlain(value))
      }
      else {
        throw Error('One of the values\'s meta field is null')
      }
    }
    await chain.write()
    return this._toAdd
  }
}