import { Model } from '../model/model';
import { DatastoreAdapter } from './adapters/adapter';
import { FilterMethod } from './interfaces/filter.type';
import { IPaginationData } from './interfaces/pagination.type';
import { GetOperation, PushOperation, DeleteOperation } from '../..';
import { IEdit } from '../types/edit.types';
import { IFullfilledModelMetadata } from '../model/model.metadata';
import { MetadataUtils } from './metadata.utils';

export class Datastore<T extends Model<T>> {
  public name: string;
  public adapter: DatastoreAdapter<T>;

  constructor(name: string, adapter: DatastoreAdapter<T>) {
    this.name = name;
    this.adapter = adapter;
  }

  async get(id: string): Promise<T | null> {
    return this.adapter.get(id)
  }

  async getItems(options?: { filter?: FilterMethod<T>, pagination?: IPaginationData }): Promise<T[]> {
    const query = new GetOperation(this)

    if (options && options.filter) {
      query.filter(options.filter)
    }
    if (options && options.pagination) {
      query.paginate(options.pagination)
    }

    return query.run()
  }

  async push(item: T): Promise<T> {
    const query = new PushOperation(this)
    return query.item(item).run()
  }

  async del(item: T | string): Promise<T | null> {
    const query = new DeleteOperation(this)
    if (typeof item === 'string') {
      return query.id(item).run()
    }
    else {
      return query.item(item).run()
    }
  }
}
