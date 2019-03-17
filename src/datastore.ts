import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'
import encodingDown from 'encoding-down'
import generateId from 'nanoid'

import { join } from 'path'
import { Model } from './model';
import { classToPlain, plainToClass } from 'class-transformer'
import EncodingDown from 'encoding-down';
import { IFilter } from './types';
import { FilterOperator } from './filter';

export interface DatastoreStreamIteratorData {
  key: string;
  value: any;
}

export interface PaginationData {
  skip: number;
  take: number;
}
export class Datastore<T extends Model<T>> {
  private name: string;
  private store: LevelUp<EncodingDown<string, any>>;
  private type: any;
  constructor(name: string, directory: string, type: () => any) {
    this.name = name
    const encoding = encodingDown<string, any>(leveldown(join(directory, name)), { valueEncoding: 'json' })
    this.store = levelup(encoding)
    this.type = type()
  }

  private convertToPlain(item: T): any {
    return classToPlain(item)
  }

  private convertToClass(item: object): T {
    return plainToClass(this.type, item)
  }

  private convertToClassWithId(id: string, item: object): T {
    const converted = this.convertToClass(item)
    converted.setData({ id, db: this })
    return converted
  }

  private convertToClassArray(item: object[]): T[] {
    return plainToClass(this.type, item)
  }

  private setData(item: T, id: string) {
    item.setData({ id, db: this })
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

  async getAll(filter?: IFilter<T>): Promise<T[]> {
    const results = await this.createReadStream<T>((data) => {
      return this.convertToClassWithId(data.key, data.value)
    })
    return results
  }


  async getFiltered(filter: FilterOperator<T>): Promise<T[]> {
    const results = await this.createReadStream<T>((data) => {
      const val = this.convertToClassWithId(data.key, data.value)
      if(filter.run(val)) {
        return val
      }
      else {
        return null
      }
    })
    return results
  }

  async get(id: string): Promise<T> {
    const data = await this.store.get(id)
    return this.convertToClassWithId(id, data)
  }

  async push(item: T): Promise<T> {
    const id = generateId()
    await this.store.put(id, this.convertToPlain(item))

    this.setData(item, id)
    return item
  }
}
