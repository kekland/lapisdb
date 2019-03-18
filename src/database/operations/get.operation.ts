import { BaseOperation } from "./database.operations";
import { FilterOperator } from "../filter/filter";
import { PaginationData, Datastore } from "../datastore/datastore";
import { SortOperator } from "../sort/sort";
import { Utils } from "../../utils";
import { ISort } from "../sort/sort.types";
import { IFilter } from "../filter/filter.types";
import { Model } from "../model/model";

export class GetOperation<T extends Model<T>> implements BaseOperation<T> {
  private _filter: FilterOperator<T> = null;
  private _pagination: PaginationData = {skip: 0, take: Infinity};
  private _sort: SortOperator<T> = null;
  private store: Datastore<T>

  constructor(store: Datastore<T>) {
    this.store = store
  }

  public filter(method: (value: IFilter<T>) => boolean): GetOperation<T> {
    this._filter = new FilterOperator(method)
    return this
  }

  public sort(data: ISort<T>): GetOperation<T> {
    this._sort = new SortOperator(data)
    return this
  }

  public paginate(data: PaginationData): GetOperation<T> {
    this._pagination = data
    return this
  }

  public skip(skip: number): GetOperation<T> {
    this._pagination.skip = skip
    return this
  }

  public take(take: number): GetOperation<T> {
    this._pagination.take = take
    return this
  }

  public async run() {
    return this.result()
  }
  
  public async result(): Promise<T[]> {
    let result = await this.store.methods.get(this._filter)
    if(this._sort) {
      result = this._sort.run(result)
    }
    if(this._pagination) {
      result = Utils.paginate(result, this._pagination)
    }
    return result
  }

  public async first(): Promise<T> {
    return (await this.result())[0]
  }

  public async last(): Promise<T> {
    const result = await this.result()
    return (await this.result())[result.length - 1]
  }

  public async count(): Promise<number> {
    return await this.store.methods.count(this._filter, this._pagination)
  }
}