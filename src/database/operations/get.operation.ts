import { BaseOperation } from "./database.operations";
import { FilterOperator } from "../filter/filter";
import { PaginationData, Datastore } from "../datastore/datastore";
import { SortOperator } from "../sort/sort";
import { Utils } from "../../utils";
import { ISort } from "../sort/sort.types";
import { IFilter } from "../filter/filter.types";
import { Model } from "../model/model";

/**
 * This operation **gets** objects from the database.
 * 
 * #### Usage
 * 
 * See [[Datastore.get]].
 * @typeparam T The model of the Datastore. `T` must extend from `Model`.
 */
export class GetOperation<T extends Model<T>> implements BaseOperation<T> {
  /** Filter data to use. Defaults to null - do not filter. */
  private _filter: FilterOperator<T> = null;

  /** Pagination data to use. Defaults to `{skip: 0, take: Infinity}`*/
  private _pagination: PaginationData = {skip: 0, take: Infinity};
  
  /** Sorting data to use. Defaults to null - do not sort. */
  private _sort: SortOperator<T> = null;
  
  /** The datastore where the operation takes place. */
  private store: Datastore<T>

  /**
   * @param store The datastore where the operation takes place.
   */
  constructor(store: Datastore<T>) {
    this.store = store
  }

  /** Same as [[filter]]. */
  public where(method: (value: IFilter<T>) => boolean): GetOperation<T> {
    return this.filter(method)
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
  public filter(method: (value: IFilter<T>) => boolean): GetOperation<T> {
    this._filter = new FilterOperator(method)
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
  public id(id: string): GetOperation<T> {
    this._filter = new FilterOperator((v) => (v as any).meta.id === id)
    return this
  }

  /** Same as [[sort]] */
  public orderBy(data: ISort<T>): GetOperation<T> {
    return this.sort(data)
  }

  /**
   * Set the sorting method.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const items = await store.get().sort({age: {sort: SortDirection.Ascending}}).run()
   * console.log(items)
   * ```
   * 
   * @param data Sorting method to use. `method` must be a type of `ISort<T>`.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public sort(data: ISort<T>): GetOperation<T> {
    this._sort = new SortOperator(data)
    return this
  }

  /**
   * Sets the pagination data.
   * Refer to [[PaginationData]] to understand how pagination works.
   *
   * @param data `skip` and `take` values.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public paginate(data: PaginationData): GetOperation<T> {
    this._pagination = data
    return this
  }

  /**
   * Sets the `skip`.
   * Refer to [[paginate]] for more information.
   *
   * @param skip The value of `skip`.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public skip(skip: number): GetOperation<T> {
    this._pagination.skip = skip
    return this
  }

  /**
   * Sets the `take`.
   * Refer to [[paginate]] for more information.
   *
   * @param skip The value of `take`.
   * @returns Returns this operation again, to make chaining methods possible.
   */
  public take(take: number): GetOperation<T> {
    this._pagination.take = take
    return this
  }

  /**
   * Runs the operation.
   * @returns Array of objects that are filtered (if you have set the filter), 
   * sorted (if you have set the sorting data) and paginated (if you have set 
   * the pagination data).
   */
  public async run(): Promise<T[]> {
    return await this.result()
  }
  
  /**
   * Same as [[run]].
   */
  public async result(): Promise<T[]> {
    let result = await this.store.methods.get(this._filter)

    result = this.store.methods.sort(result, this._sort)
    result = this.store.methods.paginate(result, this._pagination)
    
    return result
  }

  /**
   * Returns the first element of the result.
   */
  public async first(): Promise<T> {
    return (await this.result())[0]
  }

  /**
   * Returns the last element of the result.
   */
  public async last(): Promise<T> {
    const result = await this.result()
    return (await this.result())[result.length - 1]
  }

  /**
   * Returns the number of items in the result.
   */
  public async count(): Promise<number> {
    return await this.store.methods.count(this._filter, this._pagination)
  }
}