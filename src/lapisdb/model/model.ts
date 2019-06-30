import { Exclude, classToPlain } from 'class-transformer';
import { Datastore } from '../datastore/datastore';
import { IModelMetadata, IEmptyModelMetadata, IFilledModelMetadata } from './model.metadata';
import { MetadataUtils } from '../datastore/metadata.utils';
import { ClassType } from 'lapisdb';
import { DatastoreManager } from '../datastore/datastore.manager';
import { Reference } from './reference';

export abstract class Model<T extends Model<T>> {
  public meta: IModelMetadata;

  @Exclude({ toPlainOnly: true })
  private store: () => Datastore<any>;

  constructor(type: ClassType<T>) {
    const datastore = DatastoreManager.get(type)
    this.store = () => datastore
    this.meta = {} as IEmptyModelMetadata;
  }

  hasMetadata(): this is { meta: IFilledModelMetadata } {
    return this.meta.id != null && this.meta.created != null && this.meta.updated != null;
  }

  getReference(): Reference<T> {
    if (!this.hasMetadata()) {
      throw new Error('Item has no metadata.')
    }
    return new Reference(this.meta.id)
  }

  async save(): Promise<this> {
    if (!this.hasMetadata()) {
      this.meta = MetadataUtils.getNewMetadata()
    }

    await this.store().adapter.put(this)
    return this
  }

  async delete() {
    if (!this.hasMetadata()) {
      throw Error('Item has no metadata.')
    }

    await this.store().adapter.remove(this.meta.id)
  }
}
