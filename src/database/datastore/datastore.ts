import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'
import encodingDown from 'encoding-down'

import { join } from 'path'
import { classToPlain, plainToClass } from 'class-transformer'
import EncodingDown from 'encoding-down';
import { DatastoreOperations } from './datastore.methods';
import { GetOperation } from '../operations/get.operation';
import { PushOperation, BatchedPushOperation } from '../operations/push.operation';
import { Model } from '../model/model';
import { EditOperation } from '../operations/edit.operation';
import { DeleteOperation, BatchedDeleteOperation } from '../operations/delete.operation';
import { IEdit } from '../types/edit.types';

/**
 * See [[createReadStream]] for more info.
 */
export interface DatastoreStreamIteratorData {
  /** ***Identifier** of an object. Same as `value.meta.id`. Mostly unused. */
  key: string;
  
  /** The **object** itself in a plain object form. To convert it to class use [[convertToClassWithId]]. */
  value: any;
}

/**
 * Information on how to paginate an array.
 */
export interface PaginationData {
  /**
   * How many items to skip from the start.
   */
  skip: number;

  /**
   * How many items to take after skipping `skip` items.
   * If you want to take all of the items, set this to `Infinity`.
   */
  take: number;
}

/**
 * The **Datastore** object is used to call methods on LevelDB instance. 
 * 
 * #### Usage
 * 
 * ```ts
 * const store = new Datastore<Human>('human', './database', () => Human)
 * ```
 *
 * @typeparam T The model for this Datastore. `T` must extend from `Model`
*/
export class Datastore<T extends Model<T>> {
  /** Name of the database. */
  public name: string;
  /** The **LevelDB** storage. */
  private store: LevelUp<EncodingDown<string, any>>;
  /** A function that returns the type of the model. */
  private type: () => any;
  /** LevelDB method wrappers. See [[DatastoreOperations]] for more info. */
  public methods: DatastoreOperations<T>;

  /**
   * 
   * @param name The name of the database. Usually the name of the type in *lower case*.
   * @param directory The directory where the database will be created.
   * @param type A function that returns the type. For example `() => Human`
   * @param isValidated Is this datastore validated using `class-validator`?
   */
  constructor(name: string, directory: string, type: () => any, isValidated: boolean = false) {
    this.name = name
    const encoding = encodingDown<string, any>(leveldown(join(directory, name)), { valueEncoding: 'json' })
    this.store = levelup(encoding)
    this.type = type()
    this.methods = new DatastoreOperations(() => this, this.store, type, isValidated)
  }

  /** This method is used to create a new object with this model. 
   * Without calling this method, you will not be able to use .save() or .delete() methods on the object. 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const human = store.create(new Human(...))
   * await human.save() //Without using .create() this will throw.
   * ```
   * @param data `T` object to initialize.
   * @returns `T` object with its [[Model.store]] field set.
   * */
  public create(data: T): T {
    (data as any).store = this
    return data
  }

  /** This method is used to push a new object to the database.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const human = await store.push().item(new Human(...)).run()
   * console.log(human)
   * ```
   * 
   * @returns A new instance of `PushOperation<T>`. More info on this is in [[PushOperation]].
   * */
  public push(): PushOperation<T> {
    return new PushOperation(this)
  }

  /** This shorthand method is used to push a new object to the database.
   *  It is similar to the [[push]] method.
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const human = await store.pushItem(new Human(...))
   * console.log(human)
   * ```
   * @param item An item to push.
   * @returns An instance of `Promise<T>`, with `meta` field set.
   * */
  public async pushItem(item: T): Promise<T> {
    const result = await this.push().item(item).run()
    return result
  }

  /** This method is used to push a bunch of objects to the database.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const humansData: Human[] = [...]
   * const humans = await store.pushBatched().items(humansData).run()
   * console.log(humans)
   * ```
   * 
   * @returns A new instance of `BatchedPushOperation<T>`. More info on this is in [[BatchedPushOperation]].
   * */
  public pushBatched(): BatchedPushOperation<T> {
    return new BatchedPushOperation(this)
  }

  /** This method gets objects from the database.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const humans = await store.get().take(5).run()
   * console.log(humans)
   * ```
   * 
   * @returns A new instance of `GetOperation<T>`. More info on this is in [[GetOperation]].
   * */
  public get(): GetOperation<T> {
    return new GetOperation(this) 
  }

  /** This method edits one single object from database.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const humanId = '...'
   * const humanEdited = await store.edit().id(humanId).with({...}).run()
   * console.log(humanEdited)
   * ```
   * 
   * @returns A new instance of `EditOperation<T>`. More info on this is in [[EditOperation]].
   * */
  public edit(): EditOperation<T> {
    return new EditOperation(this)
  }

  /** This shorthand method is used to edit an item in the database.
   *  It is similar to the [[edit]] method.
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const human = await store.pushItem(new Human(...))
   * const editedHuman = await store.editItem(human, {...})
   * console.log(human, editedHuman)
   * ```
   * @param item Either an ID of an object or the object itself.
   * @param edit Data to edit.
   * @returns An instance of `Promise<T>`, with `meta` field set.
   * */
  public async editItem(item: string | T, edit: IEdit<T>): Promise<T> {
    let result: T;
    if(typeof item === 'string') {
      result = await this.edit().id(item).with(edit).run()
    }
    else {
      result = await this.edit().item(item).with(edit).run()
    }
    return result
  }

  /** This method deletes one single object from database.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const humanId = '...'
   * const humanEdited = await store.delete().id(humanId).run()
   * console.log(humanEdited)
   * ```
   * 
   * @returns A new instance of `DeleteOperation<T>`. More info on this is in [[DeleteOperation]].
   * */
  public delete(): DeleteOperation<T> {
    return new DeleteOperation(this)
  }

  /** This shorthand method is used to delete an item in the database.
   *  It is similar to the [[delete]] method.
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const human = await store.pushItem(new Human(...))
   * console.log(human)
   * ```
   * @param item Either an ID of an object or the object itself.
   * @returns An instance of `Promise<T>`, with `meta` field set.
   * */
  public async deleteItem(item: string | T) {
    if(typeof item === 'string') {
      await this.delete().id(item).run()
    }
    else {
      await this.delete().item(item).run()
    }
  }

  /** This method deletes a batch of objects from database.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * const humanIds: string[] = ['...', '...']
   * await store.delete().ids(humanIds).run()
   * ```
   * 
   * @returns A new instance of `BatchedDeleteOperation<T>`. More info on this is in [[BatchedDeleteOperation]].
   * */
  public deleteBatched(): BatchedDeleteOperation<T> {
    return new BatchedDeleteOperation(this)
  }

  /** This method assigns a function to onPush event.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * store.onPush((data) => console.log(data))
   * ```
   * @param func Callback method.
   * */
  public onPush(func: (data: T) => any): void {
    this.methods.onPush(func)
  }

  /** This method assigns a function to onEdit event.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * store.onEdit((id, data) => console.log(id, data))
   * ```
   * @param func Callback method.
   * */
  public onEdit(func: (id: string, data: T) => any): void {
    this.methods.onEdit(func)
  }

  /** This method assigns a function to onDelete event.
   * 
   * #### Usage
   * 
   * ```ts
   * const store = new Datastore<Human>(...)
   * store.onDelete((id) => console.log(id))
   * ```
   * @param func Callback method.
   * */
  public onDelete(func: (id: string) => any): void {
    this.methods.onDelete(func)
  }
}
