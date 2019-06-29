import { Model } from '../../model/model';

export class ModelIterable<T extends Model<T>> {
  id: string;
  value: T;

  constructor(id: string, value: T) {
    this.id = id
    this.value = value
  }
}

export interface LevelIterator {
  key: string;
  value: object;
}