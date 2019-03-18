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

  /*const items = await store.pushBatched()
    .item(store.create(new Human('lmao2', 17, ['xd 1', 'xd 2'])))
    .item(store.create(new Human('lmao1', 1, [])))
    .item(store.create(new Human('lmao 3', 891, [], 'lmao 111')))
    .push()*/

  //console.log(items)

  const item = await store.get().where((value) => value.meta.updated > value.meta.created).
  console.log(item)
  //const item = await store.push().item(new Human('xd', 18, [])).run()
 //console.log(item)
}

bootstrap()
