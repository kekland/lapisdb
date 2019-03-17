import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'
import { join } from 'path'

export class Datastore {
  private name: string;
  private store: LevelUp<LevelDown>;
  constructor(name: string, directory: string) {
    this.name = name
    this.store = levelup(leveldown(join(directory, name)))
  }
}
