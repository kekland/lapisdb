import { Model } from "../../model";
import { BaseOperation } from "./database.operations";
import { Datastore } from "../datastore/datastore";
import generateId from 'nanoid'
import { classToPlain } from "class-transformer";

export class PushOperation<T extends Model<T>> implements BaseOperation<T> {
  private toAdd: T[] = [];
  private store: Datastore<T>

  constructor(store: Datastore<T>) {
    this.store = store
  }

  public item(value: T) {
    const id = generateId()
    value.setData({id, db: this.store})
    this.toAdd.push(value)
  }

  public items(values: T[]) {
    values.forEach(value => this.item(value))
  }

  public async run(): Promise<T[]> {
    const chain = this.store.methods.store.batch()
    for(const value of this.toAdd) {
      chain.put(value.id, classToPlain(value))
    }
    await chain.write()
    return this.toAdd
  }
}