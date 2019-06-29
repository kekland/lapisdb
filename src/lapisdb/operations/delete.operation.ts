import { Model } from '../model/model';
import { BaseOperation } from './database.operations';
import { Datastore } from '../datastore/datastore';

/**
 * This operation **deletes** an object from the database.
 * #### Usage
 * See [[Datastore.delete]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class DeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  /** The datastore where the operation takes place. */
  private store: Datastore<T>;

  /** Identifier of an object to delete. */
  private identifier?: string;

  /**
   * @param store The datastore where the deletion operation takes place.
   * @param id Identifier of an object to delete.
   */
  constructor(store: Datastore<T>, id?: string) {
    this.store = store
    this.identifier = id
  }

  /**
   * Deletes this item if [[run]] or [[delete]] is called.
   * @param value An item or ID to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public value(item: T | string) {
    if (typeof item === 'string') {
      this.identifier = item
    }
    else {
      if (!item.hasMetadata()) {
        throw Error('Object\'s meta field is null')
      }
      this.identifier = item.meta.id
    }
    return this
  }

  /**
   * Runs the deletion operation.
   */
  public async run(): Promise<T | null> {
    if (this.identifier == null) {
      throw new Error('Invalid parameters for DeleteOperation.')
    }
    return await this.store.adapter.remove(this.identifier)
  }
}

/**
 * This operation **deletes** a list of objects from the database.
 * #### Usage
 * See [[Datastore.delete]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class BatchedDeleteOperation<T extends Model<T>> implements BaseOperation<T> {
  /** The datastore where the operation takes place. */
  private store: Datastore<T>;

  /** Identifier of an object to delete. */
  private identifiers: string[] = [];

  /**
   * @param store The datastore where the deletion operation takes place.
   * @param id Identifier of an object to delete.
   */
  constructor(store: Datastore<T>) {
    this.store = store
  }

  /**
   * Deletes this item if [[run]] or [[delete]] is called.
   * @param item An item to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public value(item: T | string) {
    if (typeof item === 'string') {
      this.identifiers.push(item)
    }
    else {
      if (!item.hasMetadata()) {
        throw Error('Item has no metadata.')
      }
      this.identifiers.push(item.meta.id)
    }
    return this
  }

  /**
   * Deletes item with this id if [[run]] or [[delete]] is called.
   * @param id Identifier of an item to delete.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public values(item: T[] | string[]) {
    item.forEach(this.value)
    return this
  }

  /**
   * Runs the deletion operation.
   */
  public async run(): Promise<T[]> {
    const items: T[] = []

    for (const id of this.identifiers) {
      const value = await new DeleteOperation(this.store).value(id).run()
      if (value) {
        items.push(value)
      }
    }

    return items
  }
}
