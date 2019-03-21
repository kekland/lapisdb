import { LevelUp } from "levelup";
import EncodingDown from "encoding-down";
import { FilterOperator } from "../filter/filter";
import { PaginationData, DatastoreStreamIteratorData, Datastore } from "./datastore";
import { classToPlain, plainToClass } from "class-transformer";
import generateId from 'nanoid'
import { Model } from "../model/model";
import * as moment from 'moment'
import { ValueStream } from "./value.stream";
import { SortOperator } from "../..";
import { Utils } from "../../utils";
import { IObjectFields } from "../types/typings";

/**
 * This class contains some lower-level abstractions for the **LevelDB**.
 * 
 * #### Usage
 * 
 * You should not instantiate this class, consider using [[Datastore]] instead.
 * After that, you can access this class through `datastore.methods`.
 */
export class DatastoreOperations<T extends Model<T>> {
  /** The **Datastore** object that is parent of this object. */
  private _store: () => Datastore<T>;

  /** ***LevelDB** database object. */
  public store: LevelUp<EncodingDown<string, any>>;

  /** Type of an object stored. */
  private type: () => any;


  /**
   * Creates an instance of DatastoreOperations.
   * @param db Function that returns the Datastore object.
   * @param store An instance of LevelDB database.
   * @param type Function that returns the type of a model.
   */
  constructor(db: () => Datastore<T>, store: LevelUp<EncodingDown<string, any>>, type: () => any) {
    this._store = db
    this.store = store
    this.type = type
  }

  /**
   * Converts a class item to plain item. Uses `class-transformer`.
   * @param item Item to convert to plain object.
   * @returns Plain object.
   */
  private convertToPlain(item: T): any {
    return classToPlain(item)
  }

  /**
   * Converts a plain object to a class object. Uses `class-transformer`.
   * @param item Item to convert to a class object.
   * @returns Object with type `T`.
   */
  private convertToClass(item: object): T {
    return plainToClass(this.type(), item)
  }

  /**
   * Converts a plain object to a class object, while also setting its general parameters.
   * Uses `class-transformer`.
   * @param item Item to convert to a class object and set its parameters.
   * @returns Object with type `T`.
   */
  private convertToClassWithId(item: object): T {
    const converted = this.convertToClass(item)
    converted.setDb(this._store())
    return converted
  }

  /**
   * Sets general parameters of an object, such as `meta.id` and `store`.
   * @param item Item to set parameters to.
   * @param id Identifier of an object.
   */
  private setData(item: T, id: string) {
    item.setData({ id, store: this._store() })
  }

  /**
   * Sets general parameters of an object when pushing, 
   * such as `meta.id` and `store`, also `meta.created` and `meta.updated`.
   * @param id Identifier of an object.
   * @param item Item to set parameters to.
   */
  public setPushData(id: string, item: T) {
    this.setData(item, id)
    this.setCreatedTime(item)
    this.setUpdatedTime(item)
  }

  /**
   * Sets the created time of an item to current time.
   * @param item Item to set parameters to.
   */
  public setCreatedTime(item: T) {
    item.setCreatedTime(moment.now())
  }

  /**
   * Sets the last updated time of an item to current time.
   * @param item Item to set parameters to.
   */
  public setUpdatedTime(item: T) {
    item.setUpdatedTime(moment.now())
  }

  /**
   * Created a read stream on LevelDB database. `onData` callback will be **called on each object**, and it contains
   * plain-object form of the object.
   * 
   * #### Usage
   * 
   * ```ts
   * await this.createReadStream<T>(data => values.push(data))
   * ```
   * @param onData Your own callback. Iterates through all objects in the database.
   */
  public createReadStream(): ValueStream<T> {
    const stream = this.store.createValueStream()
    return new ValueStream(stream)
  }

  /**
   * Iterates through all objects with a set filter. Returns a `ValueStream` instance.
   * 
   * @param filter Your filter object.
   */
  public createReadStreamFiltered(filter?: FilterOperator<T>): ValueStream<T> {
    const stream = this.createReadStream()

    stream.middleware = (data) => {
      let pass = true
      if (filter != null) {
        pass = filter.run(data)
      }
      return pass
    }

    return stream
  }

  /**
   * Gets all items that match the filter. Gets all of the items if no filter is given.
   * 
   * @param filter Filter object. Must be `FilterOperator<T>`.
   * @returns An array of objects that match the filter.
   */
  public async get(filter?: FilterOperator<T>): Promise<T[]> {
    const results: T[] = [];
    const stream = this.createReadStreamFiltered(filter)
    stream.onData = (data) => {
      results.push(this.convertToClassWithId(data))
    }
    await stream.untilEnd()
    return results
  }

  /**
   * Gets all items that match the filter. Gets all of the items if no filter is given.
   * Returned items are not converted to a class object - they are still in a plain
   * object form. This method is faster than `get()`.
   * 
   * @param filter Filter object. Must be `FilterOperator<T>`.
   * @returns An array of plain objects that match the filter.
   */
  public async getWithJustFields(filter?: FilterOperator<T>): Promise<IObjectFields<T>[]> {
    const results: IObjectFields<T>[] = [];
    const stream = this.createReadStreamFiltered(filter)
    stream.onData = (data) => {
      results.push(data)
    }
    await stream.untilEnd()
    return results
  }

  public sort(items: T[], sort?: SortOperator<T>): T[] {
    if (!sort) {
      return items
    }
    else {
      return sort.run(items)
    }
  }

  public paginate(items: T[], pagination?: PaginationData): T[] {
    if(!pagination) {
      return items
    }
    else {
      return Utils.paginate(items, pagination)
    }
  }

  /**
   * Gets the number of items that match the filter and are in range of 
   * your pagination data (skip, take). If none of those arguments are
   * passed, returns the total number of objects in the database.
   * 
   * @param filter Filter object. Must be `FilterOperator<T>`.
   * @param pagination Pagination object. Must be `PaginationData`. 
   * @returns The number of objects that match the filter and the pagination data.
   */
  public async count(filter?: FilterOperator<T>, pagination?: PaginationData): Promise<number> {
    let count = 0
    const stream = this.createReadStreamFiltered(filter)
    stream.onData = (data) => {
      count++
    }
    await stream.untilEnd()
    return count
  }

  /**
   * Gets an object based on its id.
   * 
   * @param id Identifier of an object.
   * @returns The object.
   * @throws If object was not found.
   */
  async getOne(id: string): Promise<T> {
    const data = await this.store.get(id)
    return this.convertToClassWithId(data)
  }

  /**
   * Pushes an object to the database.
   * 
   * @param item Object to push.
   * @returns The object with its metadata field filled.
   */
  async push(item: T): Promise<T> {
    const id = generateId()

    this.setPushData(id, item)

    const plain = this.convertToPlain(item)
    await this.store.put(id, plain)
    return item
  }

  /**
   * Updates an item in the database.
   * 
   * @param id Identifier of an object. Same as `item.meta.id`.
   * @param item New data of the object.
   * @returns The object with updated data.
   */
  async put(id: string, item: T): Promise<T> {
    this.setUpdatedTime(item)

    await this.store.put(id, this.convertToPlain(item))
    return item
  }

  /**
   * Deletes an item in the database.
   * 
   * @param id Identifier of an object.
   */
  async delete(id: string): Promise<void> {
    await this.store.del(id)
  }
}