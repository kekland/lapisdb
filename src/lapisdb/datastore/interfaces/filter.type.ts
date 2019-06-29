import { Model } from '../../..';

export type FilterMethod<T extends Model<T>> = (item: T) => boolean;
