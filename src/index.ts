import { Human } from './test/human.model';
import { Factory } from './factory';
import { FilterOperator, And, BaseFilter, Filter, Or, Not } from './database/filter/filter';
import { IFilter } from './database/filter/filter.types';
import { Datastore } from './database/datastore/datastore';
import { SortOperator } from './database/sort/sort';
import { SortDirection } from './database/sort/sort.types';

const bootstrap = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)
  
  const data = await store.get()
    .sort(new SortOperator({
      name: {
        sort: SortDirection.Descending,
      }
    }))
    .filter(new Not(
      new Filter({ name: 'Human 999' })
    ))
    .skip(0)
    .take(3)
    .result()

  console.log(data)
}

const generateDataset = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)
  for (let i = 0; i < 1000; i++) {
    const human = new Human(`Human ${i}`, i);
    await store.methods.push(human)
  }
}

// generateDataset()
bootstrap()
