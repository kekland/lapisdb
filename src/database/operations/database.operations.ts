import { FilterOperator } from "../filter/filter";
import { Datastore } from "../datastore/datastore";
import { Model } from "../model/model";

/**
 * Base class for various datastore operations (Get, Push, etc.)
 */
export abstract class BaseOperation<T extends Model<T>> {
  public async abstract run(): Promise<any>;
}