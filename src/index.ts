import { Human } from './test/human.model';
import { Factory } from './factory';
import { IFilter } from './database/filter/filter.types';
import { Datastore } from './database/datastore/datastore';
import { SortOperator } from './database/sort/sort';
import { SortDirection } from './database/sort/sort.types';
import * as moment from 'moment'
import { PushOperation } from './database/operations/push.operation';
import { EditOperation } from './database/operations/edit.operation';

const bootstrap = async () => {
  const store = new Datastore<Human>('hello', './database', () => Human)

  const myHuman = store.create(new Human('my name', 18, ['1', '2']))
  console.log(myHuman)
  await myHuman.save()
  console.log(myHuman)
}

bootstrap()
