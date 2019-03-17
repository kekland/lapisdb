import { Model } from "../../model";
import { FilterOperator } from "../filter/filter";
import { Datastore } from "../datastore/datastore";

export abstract class BaseOperation<T extends Model<T>> {
  public async abstract run(store: Datastore<T>);
}