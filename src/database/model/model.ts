import { Exclude, classToPlain } from 'class-transformer';
import { Datastore } from '../datastore/datastore';
import { IModelMetadata, IEmptyModelMetadata, IFullfilledModelMetadata } from './model.metadata';


export class Model<T extends Model<T>> {
  public meta: IModelMetadata;

  @Exclude({ toPlainOnly: true })
  private store?: () => Datastore<T>;

  constructor(store: Datastore<T>) {
    this.store = () => store;
    this.meta = {} as IEmptyModelMetadata;
  }

  hasMetadata(): this is {meta: IFullfilledModelMetadata} {
    return this.meta.id != null && this.meta.created != null && this.meta.updated != null;
  }
}
