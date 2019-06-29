import { Model } from '../model/model';
import { DatastoreAdapter } from './adapters/adapter';
import { FilterMethod } from './interfaces/filter.type';
import { IPaginationData } from './interfaces/pagination.type';

export class Datastore<T extends Model<T>> {
  name: string;
  adapter: DatastoreAdapter<T>;

  constructor(name: string, adapter: DatastoreAdapter<T>) {
    this.name = name;
    this.adapter = adapter;
  }

  async getItem(id: string): Promise<T> {
    return this.adapter.get(id)
  }

  async getItems(options?: { filter?: FilterMethod<T>, pagination?: IPaginationData }): Promise<T[]> {
    const items: T[] = []

    for await (const item of this.adapter.stream()) {

    }
  }
}
