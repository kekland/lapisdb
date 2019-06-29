import { Model } from '../../model/model';
import { ModelIterable } from '../interfaces/model.iterator';

export abstract class DatastoreAdapter<T extends Model<T>> {
  abstract async open(): Promise<void>;
  abstract async close(): Promise<void>;

  abstract async get(id: string): Promise<T | null>;
  abstract async put(item: T): Promise<T>;
  abstract async remove(id: string): Promise<T | null>;
  abstract stream(callback: (item: T) => void): Promise<void>;
}
