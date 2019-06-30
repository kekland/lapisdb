import { ClassType, Model } from '../..';
import { DatastoreManager } from '../datastore/datastore.manager';

export class Reference<T extends Model<T>> {
  id: string;

  constructor(id: string) {
    this.id = id
  }

  async get(type: ClassType<T>): Promise<T | null> {
    const datastore = DatastoreManager.get(type)
    return datastore.get(this.id);
  }
}
