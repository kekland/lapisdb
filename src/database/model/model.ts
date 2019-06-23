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
  public meta: IObjectMetadata = { id: '_' };

  /** `Datastore` object that handles this model. */
  @Exclude({ toPlainOnly: true })
  private store?: Datastore<any>;


  /**
   * Creates an instance of Model.
   * @param data Optional data to pass.
   * @memberof Model
   */
  constructor(data?: { id: string, store: Datastore<T> }) {
    if (data != null) {
      this.meta = { id: data.id }
      this.store = data.store
    }
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
    if (this.store) {
      if (this.meta && this.meta.id) {
        await this.store.edit().item(this).with({}).run()
      }
      else {
        await this.store.push().item(this).run()
      }
    }
    else {
      throw Error('The model\'s store field is null. Use `datastore.create()` to create objects.')
    }
  }

  /**
   * Deletes the object via `Datastore`. You have to make sure that `this.store`
   * is not null.
   */
  public async delete() {
    if (this.store) {
      await this.store.delete().item(this).run()
    }
    else {
      throw Error('The model\'s store field is null. Delete the item using datastore\'s methods.')
    }
  }

  public async onGet() {}
  
  public async onBeforePush() {}
  public async onAfterPush() {}

  public async onBeforeEdit() {}
  public async onAfterEdit() {}

  public async onBeforeDelete() {}
  public async onAfterDelete() {}
}
