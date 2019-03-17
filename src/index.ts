import { Human } from './test/human.model';
import { Factory } from './factory';
import { FilterOperator, And, BaseFilter, Filter, Or } from './database/filter/filter';
import { IFilter } from './database/filter/filter.types';
import { Datastore } from './database/datastore/datastore';
import { SortOperator } from './database/sort/sort';
import { SortDirection } from './database/sort/sort.types';

const bootstrap = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)
  /*const human = new Human('Human 1');
  console.log(human)

  const newHuman = await store.push(human)
  console.log(human)
  console.log(newHuman)*/

  // const factory = new Factory(() => Human, store)
  // const manufacturedHuman = factory.create(new Human('hey!'))
  // const search = await store.get('cgxlTziADs38bMCloIKZ3')

  /*const dataFiltered = await store.getRaw(
    new BaseFilter(
      new Or(
        new Filter({ name: { operator: 'equal', value: 'Human 44' } }),
        new Filter({ name: { operator: 'greater', value: 'Human 88' } }),
      )
    )
  )*/

  //const dataFiltered = await store.get().skip(0).filter(new Filter({name: 'Human 256'})).first()
  //console.log(dataFiltered)
  const data = await store.get()
    .sort(new SortOperator({
      name: {
        sort: SortDirection.Descending,
      }
    }))
    .skip(0)
    .take(3)
    .result()
  console.log(data)
}

const generateDataset = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)
  for (let i = 0; i < 1000; i++) {
    const human = new Human(`Human ${i}`);
    await store.methods.push(human)
  }
}

// generateDataset()
bootstrap()
