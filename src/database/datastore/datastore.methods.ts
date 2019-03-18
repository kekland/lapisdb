import { LevelUp } from "levelup";
import EncodingDown from "encoding-down";
import { FilterOperator } from "../filter/filter";
import { PaginationData, DatastoreStreamIteratorData, Datastore } from "./datastore";
import { classToPlain, plainToClass } from "class-transformer";
import generateId from 'nanoid'
import { Model } from "../model/model";
import * as moment from 'moment'

export class DatastoreOperations<T extends Model<T>> {
  private db: () => Datastore<T>;
  public store: LevelUp<EncodingDown<string, any>>;
  private type: () => any;

  constructor(db: () => Datastore<T>, store: LevelUp<EncodingDown<string, any>>, type: () => any) {
    this.db = db
    this.store = store
    this.type = type
  }

  private convertToPlain(item: T): any {
    return classToPlain(item)
  }

  private convertToClass(item: object): T {
    return plainToClass(this.type(), item)
  }

  private convertToClassWithId(id: string, item: object): T {
    const converted = this.convertToClass(item)
    converted.setData({ id, db: this.db() })
    return converted
  }

  private convertToClassArray(item: object[]): T[] {
    return plainToClass(this.type(), item)
  }

  private setData(item: T, id: string) {
    item.setData({ id, db: this.db() })
  }

  public setPushData(id: string, item: T) {
    this.setData(item, id)
    this.setCreatedTime(item)
    this.setUpdatedTime(item)
  }
  public setCreatedTime(item: T) {
    item.setCreatedTime(moment.now())
  }

  public setUpdatedTime(item: T) {
    item.setUpdatedTime(moment.now())
  }

  private createReadStream<I>(onData: (data: DatastoreStreamIteratorData) => I | null): Promise<I[]> {
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

  private async iterateThroughObjects(onPass: (data: DatastoreStreamIteratorData) => void, filter?: FilterOperator<T>): Promise<void> {
    await this.createReadStream<T>((data) => {
      const object = data.value
      object.id = data.key
      if (filter != null) {
        if (!filter.run(object)) {
          return null
        }
      }
      onPass(data)
      return null
    })
  }

  public async get(filter?: FilterOperator<T>): Promise<T[]> {
    const results: T[] = [];
    await this.iterateThroughObjects((data) => {
      results.push(this.convertToClassWithId(data.key, data.value))
    }, filter)
    return results
  }

  public async count(filter?: FilterOperator<T>, pagination?: PaginationData): Promise<number> {
    let count = 0

    await this.iterateThroughObjects((data) => {
      count++
    }, filter)

    if (count > pagination.take) {
      return pagination.take
    }
    return count
  }

  async getOne(id: string): Promise<T> {
    const data = await this.store.get(id)
    return this.convertToClassWithId(id, data)
  }

  async push(item: T): Promise<T> {
    const id = generateId()

    this.setPushData(id, item)

    await this.store.put(id, this.convertToPlain(item))
    return item
  }

  async put(id: string, item: T): Promise<T> {
    this.setUpdatedTime(item)

    await this.store.put(id, this.convertToPlain(item))
    return item
  }

  async delete(id: string): Promise<void> {
    await this.store.del(id)
  }
}