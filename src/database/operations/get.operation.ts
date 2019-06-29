import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import { Model } from "../model/model";
import { FilterMethod } from '../datastore/interfaces/filter.type';
import { IPaginationData } from '../datastore/interfaces/pagination.type';

/**
 * This operation **gets** objects from the database.
 * 
 * #### Usage
 * 
 * See [[Datastore.get]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class GetOperation<T extends Model<T>> implements BaseOperation<T> {
  private _filter: FilterMethod<T> = (_) => true;
  private _pagination: IPaginationData = {skip: 0, take: Infinity};
  private store: Datastore<T>

  /**
   * @param store The datastore where the operation takes place.
   */
  constructor(store: Datastore<T>) {
    this.store = store
  }

  /**
   * Set the filtering method.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const items = await store.get().filter((human) => human.age > 18).run()
   * console.log(items)
   * ```
   * 
   * @param method Filtering method to use. `method` is a user-defined callback,
   * and it is fired on every object in the database. If the callback returns `true`,
   * object is said to 'pass' the filter, and is added to the final list.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public filter(method: FilterMethod<T>): this {
    this._filter = method
    return this
  }

  /**
   * Get item by its ID.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const item = await store.get().id('abcdef').first()
   * console.log(item)
   * ```
   * 
   * @param id ID of an object.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public id(id: string): this {
    this._filter = (v) => (v as any).meta.id === id;
    return this
  }

  /**
   * Sets the pagination data.
   * Refer to [[IPaginationData]] to understand how pagination works.
   *
   * @param data `skip` and `take` values.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public paginate(data: IPaginationData): this {
    this._pagination = data
    return this
  }

  /**
   * Runs the operation.
   * @returns Array of objects that are filtered (if you have set the filter), 
   * sorted (if you have set the sorting data) and paginated (if you have set 
   * the pagination data).
   */
  public async run(): Promise<T[]> {
    let result: T[] = [];
    
    for await(const item of this.store.adapter.stream()) {
      const value = item.value
      const passedFilter = this._filter(value)
      if(passedFilter) {
        result.push(value)
      }
    }
    
    const skip = this._pagination.skip || 0;
    const take = this._pagination.take || Infinity;
    return result.slice(skip, skip + take)
  }
  
  /**
   * Same as [[first]].
   */
  public async one(): Promise<T | null> {
    return this.first()
  }

  /**
   * Returns the first element of the result.
   */
  public async first(): Promise<T | null> {
    const result = await this.run()
    return (result.length > 0)? result[0] : null
  }

  /**
   * Returns the last element of the result.
   */
  public async last(): Promise<T | null> {
    const result = await this.run()
    return (result.length > 0)? result[result.length - 1] : null
  }
}