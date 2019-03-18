import { Exclude, classToPlain } from 'class-transformer';
import { Datastore } from '../datastore/datastore';

/**
 * Metadata fields of an object. You should not set these fields by yourself.
 * Everything is done automatically by `Datastore`.
 */
export interface IObjectMetadata {
  /** Identifier of an object */
  id: string;

  /** Time when object was created (UNIX timestamp) */
  created?: number;

  /** Time when object was last updated (UNIX timestamp) */
  updated?: number;
}

/**
 * Model is essentialy a set of fields and functions that is used in `Datastore`.
 * 
 * It contains `.meta` field, that contains the identifier of an object, etc.
 * 
 * #### Usage
 * 
 * ```ts
 * export class Human extends Model<Human> {
 *   name: string;
 * 
 *   constructor(name: string) {
 *     super()
 *     this.name = name
 *   }
 * }
 * ```
 * 
 * @typeparam T The object that extends the model.
 */
export class Model<T extends Model<T>> {
  /** 
   * Meta contains the 'metadata' fields of an object. This includes the
   * identifier, creation time and last updated time.
   */
  public meta: IObjectMetadata;

  /** `Datastore` object that handles this model. */
  @Exclude({ toPlainOnly: true })
  private store: Datastore<any>;


  /**
   * Creates an instance of Model.
   * @param data Optional data to pass.
   * @memberof Model
   */
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

  /**
   * Sets the fields that are required by `Datastore`.
   *
   * @param data Identifier of an object and the `Datastore` object.
   */
  public setData(data: { id: string, store: Datastore<T> }) {
    if (this.meta == null) {
      this.meta = { id: data.id }
    }
    else {
      this.meta.id = data.id
    }
    this.store = data.store
  }

  /**
   * Sets the creation time of an object.
   *
   * @param time UNIX timestamp of the time.
   */
  public setCreatedTime(time: number) {
    if (this.meta == null) { return; }
    this.meta.created = time
  }

  /**
   * Sets the last updated time of an object.
   *
   * @param time UNIX timestamp of the time.
   */
  public setUpdatedTime(time: number) {
    if (this.meta == null) { return; }
    this.meta.updated = time
  }

  /**
   * Sets the `Datastore` object of this model.
   *
   * @param store The `Datastore` object.
   */
  public setDb(store: Datastore<T>) {
    this.store = store
  }

  /**
   * Saves the object via `Datastore`. You have to make sure that `this.store`
   * is not null. 
   * 
   * If the object already has `this.meta.id` set, it will update the object in
   * the database under `this.meta.id`. Otherwise, if the identifier not set, 
   * it will create a new object in the database and set the `this.meta` field.
   */
  public async save() {
    if (this.meta && this.meta.id) {
      await this.store.edit().item(this).with({}).run()
    }
    else {
      await this.store.push().item(this).run()
    }
  }

  /**
   * Deletes the object via `Datastore`. You have to make sure that `this.store`
   * is not null.
   */
  public delete() {
    this.store.delete().item(this).run()
  }

  /** @ignore */
  public log(func: (any) => void) {
    func(classToPlain(this))
  }
}
