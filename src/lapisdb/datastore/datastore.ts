import { Model } from '../model/model';
import { DatastoreAdapter } from './adapters/adapter';
import { FilterMethod } from './interfaces/filter.type';
import { IPaginationData } from './interfaces/pagination.type';
import { GetOperation, PushOperation, DeleteOperation, ClassType } from '../..';
import { BatchedPushOperation } from '../operations/push.operation';
import { BatchedDeleteOperation } from '../operations/delete.operation';

export class Datastore<T extends Model<T>> {
  public name: string;
  public type: ClassType<T>;
  public adapter: DatastoreAdapter<T>;

  constructor(name: string, type: ClassType<T>, adapter: DatastoreAdapter<T>) {
    this.name = name;
    this.type = type
    this.adapter = adapter;
  }

  async get(condition: string | Partial<T>): Promise<T | null> {
    if (typeof condition === 'string') {
      return this.adapter.get(condition)
    }
    else {
      const keys = Object.keys(condition)
      return new GetOperation(this).filter((item) => {
        for (const key of keys) {
          const passesKey = (item as any)[key] === (condition as any)[key]
          if (!passesKey) {
            return false
          }
        }
        return true
      }).one()
    }
  }

  async getItems(filter?: FilterMethod<T>, pagination?: IPaginationData): Promise<T[]> {
    const query = new GetOperation(this)

    if (filter) {
      query.filter(filter)
    }
    if (pagination) {
      query.paginate(pagination)
    }

    return query.run()
  }

  async push(item: T): Promise<T> {
    const query = new PushOperation(this)
    return query.item(item).run()
  }

  async pushItems(items: T[]): Promise<T[]> {
    const query = new BatchedPushOperation(this)
    return query.items(items).run()
  }

  async remove(item: T | string): Promise<T | null> {
    const query = new DeleteOperation(this)
    return query.value(item).run()
  }

  async removeItems(items: T[] | string[]): Promise<T[]> {
    const query = new BatchedDeleteOperation(this)
    return query.values(items).run()
  }
}
