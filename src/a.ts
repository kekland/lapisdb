import { Model, Datastore } from '.';
import { Reference } from './lapisdb/model/reference';
import { Type } from 'class-transformer';
import { DatastoreManager } from './lapisdb/datastore/datastore.manager';
import { LevelDbAdapter } from 'lapisdb-level-adapter'

export class Book extends Model<Book> {
  name: string;

  @Type(() => Date)
  dateOfRelease: Date;

  constructor(name: string, dateOfRelease: Date) {
    super(Book)
    this.name = name
    this.dateOfRelease = dateOfRelease
  }
}

export class Human extends Model<Human> {
  name: string;
  age: number;

  @Type(() => Reference)
  booksRead: Array<Reference<Book>>;

  constructor(name: string, age: number) {
    super(Human)
    this.name = name
    this.age = age
    this.booksRead = []
  }
}

const bootstrap = async () => {
  DatastoreManager.initialize(
    new Datastore<Human>('humans', Human, new LevelDbAdapter(Human, { name: 'humans', directory: './database' })),
    new Datastore<Book>('books', Book, new LevelDbAdapter(Book, { name: 'books', directory: './database' })),
  )

  const human = new Human('a', 18)
  await human.save()

  for (let i = 0; i < 5; i++) {
    const book = new Book(`book${i}`, new Date(Date.now()))
    await book.save()
  }

  const books = await DatastoreManager.get(Book).getItems()
  human.booksRead.push(books[0].getReference())
  await human.save()
  
  const human1 = await DatastoreManager.get(Human).get(human.meta.id as string) as Human
  const b = await human1.booksRead[0].get(Book)
}

bootstrap()
