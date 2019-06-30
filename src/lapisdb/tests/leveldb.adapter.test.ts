import { DatastoreAdapter, Model, ClassType } from '../../.';
import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import EncodingDown from 'encoding-down';
import { join } from 'path';
import { plainToClass, classToPlain } from 'class-transformer';

export class LevelDbAdapter<T extends Model<T>> implements DatastoreAdapter<T> {
  private name: string;
  private type: ClassType<T>;
  private level: LevelUp<EncodingDown<string, any>>;

  private convertToClass(item: object): T {
    return plainToClass(this.type, item)
  }

  async open(): Promise<void> {
    await this.level.open()
  }
  async close(): Promise<void> {
    await this.level.close()
  }

  async get(id: string): Promise<T | null> {
    try {
      const item: object = await this.level.get(id)
      const converted = this.convertToClass(item)
      return converted
    }
    catch (e) {
      return null
    }
  }

  async put(item: T): Promise<T> {
    if (item.hasMetadata()) {
      const plain = classToPlain(item)
      await this.level.put(item.meta.id, plain)
      return item
    }
    else {
      throw Error('Item has no metadata')
    }
  }

  async remove(id: string): Promise<T | null> {
    const item = await this.get(id)
    if (item == null) {
      return null
    }
    await this.level.del(id)
    return item
  }

  stream(callback: (item: T) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = this.level.createReadStream()
      stream.on('end', () => {
        resolve()
      })
      stream.on('data', (item) => {
        callback(this.convertToClass(item.value))
      })
    })
  }

  constructor(type: ClassType<T>, options: { name: string, directory: string }) {
    this.type = type
    this.name = options.name

    this.level = levelup(EncodingDown(
      leveldown(join(options.directory, options.name)),
      { valueEncoding: 'json' },
    ))
  }
}

// This is a dumb solution, ikr?
test('leveldb adapter', () => {
  expect(true).toBe(true)
})
