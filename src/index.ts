import { Human } from './test/human.model';
import { Factory } from './factory';
import { IFilter } from './database/filter/filter.types';
import { Datastore } from './database/datastore/datastore';
import { SortOperator } from './database/sort/sort';
import { SortDirection } from './database/sort/sort.types';
import * as moment from 'moment'
import { PushOperation } from './database/operations/push.operation';
const bootstrap = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)

  const data = await store.get()
    .sort({name: {sort: SortDirection.Descending}})
    .filter((value): boolean => value.name == 'Human 88' || value.name == 'Human 44' || value.name == 'Human 22')
    .count()

  console.log(data)
}

const generateDataset = async () => {
  const timeStart = moment.now()
  const store = new Datastore<Human>('hello', './database', () => Human)
  const operation = store.push()
  for (let i = 0; i < 1000; i++) {
    const human = new Human(`Human ${i}`, i, [], 'kek');
    operation.item(human)
  }
  await operation.run()
  console.log(moment.now() - timeStart)
}

// generateDataset()
bootstrap()
