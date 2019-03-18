import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'
import encodingDown from 'encoding-down'

import { join } from 'path'
import { classToPlain, plainToClass } from 'class-transformer'
import EncodingDown from 'encoding-down';
import { DatastoreOperations } from './datastore.methods';
import { GetOperation } from '../operations/get.operation';
import { PushOperation } from '../operations/push.operation';
import { Model } from '../model/model';
import { EditOperation } from '../operations/edit.operation';
import { DeleteOperation } from '../operations/delete.operation';

export interface DatastoreStreamIteratorData {
  key: string;
  value: any;
}

export interface PaginationData {
  skip: number;
  take: number;
}
export class Datastore<T extends Model<T>> {
  private name: string;
  private store: LevelUp<EncodingDown<string, any>>;
  private type: () => any;
  public methods: DatastoreOperations<T>;
  constructor(name: string, directory: string, type: () => any) {
    this.name = name
    const encoding = encodingDown<string, any>(leveldown(join(directory, name)), { valueEncoding: 'json' })
    this.store = levelup(encoding)
    this.type = type()
    this.methods = new DatastoreOperations(() => this, this.store, type)
  }

  public create(data: T) {
    data.setDb(this)
    return data
  }

  public push(): PushOperation<T> {
    return new PushOperation(this)
  }

  public get(): GetOperation<T> {
    return new GetOperation(this) 
  }

  public edit(): EditOperation<T> {
    return new EditOperation(this)
  }

  public delete(): DeleteOperation<T> {
    return new DeleteOperation(this)
  }
}
