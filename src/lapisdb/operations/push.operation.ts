import { BaseOperation } from './database.operations';
import { Datastore } from '../datastore/datastore';
import generateId from 'nanoid'
import { classToPlain } from 'class-transformer';
import { Model } from '../model/model';
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
  private toAdd?: T;

  /** The datastore where the operation takes place. */
  private store: Datastore<T>

  /**
   * @param store The datastore where the deletion operation takes place.
   */
  constructor(store: Datastore<T>) {
    this.store = store
  }

  /**
   * Sets the item to push into the database.
   * @param value An item to push.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(value: T): this {
    this.toAdd = value
    return this
  }

  /**
   * Runs the operation and pushes the item.
   * @returns Returns the item with `item.meta` field set.
   */
  public async run(): Promise<T> {
    if (this.toAdd) {
      this.toAdd.meta = MetadataUtils.getNewMetadata()
      return await this.store.adapter.put(this.toAdd)
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
 * See [[Datastore.push]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class BatchedPushOperation<T extends Model<T>> implements BaseOperation<T>{
  /** Object to push. */
  private toAdd: T[] = [];

  /** The datastore where the operation takes place. */
  private store: Datastore<T>

  /**
   * @param store The datastore where the deletion operation takes place.
   */
  constructor(store: Datastore<T>) {
    this.store = store
  }

  /**
   * Sets the item to push into the database.
   * @param value An item to push.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public item(value: T): this {
    this.toAdd.push(value)
    return this
  }

  /**
   * Adds items to push into the database.
   * @param values List of items to push.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public items(values: T[]): this {
    values.forEach(this.item)
    return this
  }

  /**
   * Runs the operation and pushes the items.
   * @returns Returns the items with `item.meta` field set.
   */
  public async run(): Promise<T[]> {
    const items: T[] = []

    for (const item of this.toAdd) {
      const value = await new PushOperation(this.store).item(item).run()
      items.push(value)
    }

    return items
  }
}
