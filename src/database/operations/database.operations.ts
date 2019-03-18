import { FilterOperator } from "../filter/filter";
import { Datastore } from "../datastore/datastore";
import { Model } from "../model/model";

export abstract class BaseOperation<T extends Model<T>> {
  public async abstract run();
}