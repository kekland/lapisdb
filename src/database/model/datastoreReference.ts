import { Model } from '../..';

export class DatastoreReference<T extends Model<T>> {
  id: string;

  constructor(item : T) {
    this.id = item.meta.id
  }
}