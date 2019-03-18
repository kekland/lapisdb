import { LevelUp } from "levelup";
import EncodingDown from "encoding-down";
import { FilterOperator } from "../filter/filter";
import { PaginationData, DatastoreStreamIteratorData, Datastore } from "./datastore";
import { classToPlain, plainToClass } from "class-transformer";
import generateId from 'nanoid'
import { Model } from "../model/model";
import * as moment from 'moment'

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
  private convertToClassWithId(id: string, item: object): T {
    const converted = this.convertToClass(item)
    converted.setData({ id, store: this._store() })
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
   * Created a read stream on LevelDB database. `onData` callback will be **called on each object**,
   * and if the callback returns **non-null** value, it will add this value to an array and return
   * it later, when the stream will end.
   * 
   * #### Usage
   * 
   * ```ts
   * const allObjects = await this.createReadStream<T>(data => data.value)
   * ```
   * @param onData Your own callback. If the callback returns value of type `I` or non-null value,
   * it will add the returned value to an array.
   * @typeparam I Type of the values that are added to an array.
   */
  public createReadStream<I>(onData: (data: DatastoreStreamIteratorData) => I | null): Promise<I[]> {
    return new Promise((resolve, reject) => {
      try {
        const result: I[] = [];
        const stream = this.store.createReadStream()
        stream.on('data', (data: DatastoreStreamIteratorData) => {
          const res = onData(data)
          if (res != null) {
            result.push(res)
          }
        })
        stream.on('end', () => {
          resolve(result)
        })
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Iterates through all objects with a set filter. Calls `onPass` when a object 
   * passes through filter.
   * 
   * @param onPass Your own callback. It will be fired with an object that object
   * successfully passes through filter.
   */
  public async iterateThroughObjectsWithFilter(onPass: (data: DatastoreStreamIteratorData) => void, filter?: FilterOperator<T>): Promise<void> {
    await this.createReadStream<T>((data) => {
      const object = data.value
      if (filter != null) {
        if (!filter.run(object)) {
          return null
        }
      }
      onPass(data)
      return null
    })
  }

  /**
   * Gets all items that match the filter. Gets all of the items if no filter is given.
   * 
   * @param filter Filter object. Must be `FilterOperator<T>`.
   * @returns An array of objects that match the filter.
   */
  public async get(filter?: FilterOperator<T>): Promise<T[]> {
    const results: T[] = [];
    await this.iterateThroughObjectsWithFilter((data) => {
      results.push(this.convertToClassWithId(data.key, data.value))
    }, filter)
    return results
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

    await this.iterateThroughObjectsWithFilter((data) => {
      count++
    }, filter)

    if (count > pagination.take) {
      return pagination.take
    }
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
    return this.convertToClassWithId(id, data)
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