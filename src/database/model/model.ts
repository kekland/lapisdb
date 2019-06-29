import { Exclude, classToPlain } from 'class-transformer';
import { Datastore } from '../datastore/datastore';
import { IModelMetadata, IEmptyModelMetadata, IFullfilledModelMetadata } from './model.metadata';


export class Model<T extends Model<T>> {
  public meta: IModelMetadata;

  @Exclude({ toPlainOnly: true })
  private store: () => Datastore<any>;

  constructor(store: Datastore<T>) {
    this.store = () => store;
    this.meta = {} as IEmptyModelMetadata;
  }

  hasMetadata(): this is { meta: IFullfilledModelMetadata } {
    return this.meta.id != null && this.meta.created != null && this.meta.updated != null;
  }

  async save() {
    if (!this.hasMetadata()) {
      throw Error('Item has no metadata.')
    }

    await this.store().adapter.put(this)
  }

  async delete() {
    if (!this.hasMetadata()) {
      throw Error('Item has no metadata.')
    }

    await this.store().adapter.remove(this.meta.id)
  }
}
