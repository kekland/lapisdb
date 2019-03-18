import { Model, Datastore, SortDirection } from 'sirano'
import * as moment from 'moment'
import * as chalk from 'chalk'

interface OperationResult {
  name: string,
  count: number,
  timeMillis: number
}
class SimpleObject extends Model<SimpleObject> {
  name: string;

  constructor(name: string) {
    super()
    this.name = name
  }
}
const store = new Datastore<SimpleObject>('simpleObject', './database', () => SimpleObject)

async function runMeasured(count: number, func: (count: number) => Promise<void>): Promise<number> {
  let startTime = moment.now()
  await func(count)
  let endTime = moment.now()
  return endTime - startTime
}

async function clearStore(): Promise<void> {
  const objects = await store.get().result()
  await store.deleteBatched().items(objects).run()
}

async function addElements(count: number): Promise<void> {
  const operation = store.pushBatched()
  for (let i = 0; i < count; i++) {
    operation.item(new SimpleObject(`${i}`))
  }
  await operation.run()
}

async function pushUnbatched(count: number): Promise<OperationResult> {
  await clearStore()
  const time = await runMeasured(count, async (count) => {
    for (let i = 0; i < count; i++) {
      await store.push().item(new SimpleObject(`${i}`)).run()
    }
  })
  return {
    name: 'push-unbatched',
    count: count,
    timeMillis: time
  }
}

async function pushBatched(count: number): Promise<OperationResult> {
  await clearStore()
  const time = await runMeasured(count, async (count) => {
    const operation = store.pushBatched()
    for (let i = 0; i < count; i++) {
      operation.item(new SimpleObject(`${i}`))
    }
    await operation.run()
  })
  return {
    name: 'push-batched',
    count: count,
    timeMillis: time
  }
}

async function get(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)

  const time = await runMeasured(count, async (count) => {
    const items = await store.get().result()
  })

  return {
    name: 'get',
    count: count,
    timeMillis: time
  }
}

async function getFiltered(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)

  const time = await runMeasured(count, async (count) => {
    const items = await store.get().filter((item) => item.name > '3').result()
  })

  return {
    name: 'get-filtered',
    count: count,
    timeMillis: time
  }
}

async function getSorted(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)

  const time = await runMeasured(count, async (count) => {
    const items = await store.get().sort({ name: { sort: SortDirection.Ascending } }).result()
  })

  return {
    name: 'get-sorted',
    count: count,
    timeMillis: time
  }
}

async function getFilteredAndSorted(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)

  const time = await runMeasured(count, async (count) => {
    const items = await store.get().filter((item) => item.name > '3').sort({ name: { sort: SortDirection.Ascending } }).result()
  })

  return {
    name: 'get-filtered-and-sorted',
    count: count,
    timeMillis: time
  }
}

async function edit(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)
  const item = await store.get().first()

  const time = await runMeasured(count, async (count) => {
    for(let i = 0; i < count; i++) {
      item.name = `${i}`
      await item.save()
    }
  })

  return {
    name: 'edit',
    count: count,
    timeMillis: time
  }
}

async function deleteUnbatched(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)

  const time = await runMeasured(count, async (count) => {
    const elements = await store.get().result()
    for (const element of elements) {
      await element.delete()
    }
  })

  return {
    name: 'delete-unbatched',
    count: count,
    timeMillis: time
  }
}

async function deleteBatched(count: number): Promise<OperationResult> {
  await clearStore()
  await addElements(count)

  const time = await runMeasured(count, async (count) => {
    const elements = await store.get().result()
    await store.deleteBatched().items(elements).run()
  })

  return {
    name: 'delete-batched',
    count: count,
    timeMillis: time
  }
}

const methods: ((number) => Promise<OperationResult>)[] =
  [
    pushUnbatched, pushBatched,
    get, getFiltered, getSorted, getFilteredAndSorted,
    edit,
    deleteUnbatched, deleteBatched
  ]

const count = 100000
async function benchmark() {
  await clearStore()
  for (const method of methods) {
    const result = await method(count)
    console.log(`${chalk.default.green(result.name)}:`)
    console.log(`\t${chalk.default.blue(`${result.timeMillis}`)}ms ${chalk.default.gray('for')} ${chalk.default.blue(`${result.count}`)}ops`)
    console.log(`\t${chalk.default.green(`${(result.count / result.timeMillis) * 1000}`)}op/s`)
    console.log(`\n`)
  }
}

benchmark()