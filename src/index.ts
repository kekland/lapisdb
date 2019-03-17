import { Datastore } from './datastore';
import { Human } from './test/human.model';
import { Factory } from './factory';
import { FilterOperator, And, BaseFilter, Filter, Or } from './filter';
import { IFilter } from './types';

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

  const dataFiltered = await store.getFiltered(
    new BaseFilter(
      new Or(
        new Filter({ name: { operator: 'equal', value: 'Human 44' } }),
        new Filter({ name: { operator: 'greater', value: 'Human 88' } })
      )
    )
  )
  console.log(dataFiltered)
}

const generateDataset = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)
  for (let i = 0; i < 1000; i++) {
    const human = new Human(`Human ${i}`);
    await store.push(human)
  }
}

// generateDataset()
bootstrap()
