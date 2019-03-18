import { Exclude, classToPlain } from 'class-transformer';
import { Datastore } from '../datastore/datastore';

export interface IObjectMetadata {
  id: string;
  created?: number;
  updated?: number;
}

export class Model<T extends Model<T>> {
  public meta: IObjectMetadata;

  @Exclude({ toPlainOnly: true })
  private store: Datastore<any>;

  constructor(data?: { id?: string, store?: Datastore<T> }) {
    if (data != null) {
      this.meta = { id: data.id }
      this.store = data.store
    }
    else {
      this.meta = null
      this.store = null
    }
  }

  public setData(data: { id: string, store: Datastore<T> }) {
    if (this.meta == null) {
      this.meta = { id: data.id }
    }
    else {
      this.meta.id = data.id
    }
    this.store = data.store
  }

  public setCreatedTime(time: number) {
    if (this.meta == null) { return; }
    this.meta.created = time
  }

  public setUpdatedTime(time: number) {
    if (this.meta == null) { return; }
    this.meta.updated = time
  }

  public setDb(store: Datastore<T>) {
    this.store = store
  }

  public async save() {
    if (this.meta && this.meta.id) {
      await this.store.edit().item(this).with({}).run()
    }
    else {
      await this.store.push().item(this).run()
    }
  }

  public delete() {
    this.store.delete().item(this).run()
  }

  public log(func: (any) => void) {
    func(classToPlain(this))
  }
}