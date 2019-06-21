import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('Callback', () => {
  it('for onPush', async () => {
    let receivedPushData = null
    testStore.onPush((data) => {
      receivedPushData = data
    })
    const newPlanet = await testStore.push().item(new Planet('a', 0)).run()
    expect(newPlanet).toEqual(receivedPushData)
  })
  it('for onEdit', async () => {
    let receivedEditData = null
    testStore.onEdit((id, data) => {
      receivedEditData = data
    })
    const newPlanet = await testStore.push().item(new Planet('a', 0)).run()
    const editedPlanet = await testStore.edit().item(newPlanet).with({ index: 1 }).run()
    expect(editedPlanet).toEqual(receivedEditData)
  })
  it('for onDelete', async () => {
    let receivedDeleteData = null
    testStore.onDelete((data) => {
      receivedDeleteData = data
    })
    const newPlanet = await testStore.push().item(new Planet('a', 0)).run()
    await testStore.delete().item(newPlanet).run()
    expect(newPlanet.meta.id).toEqual(receivedDeleteData)
  })
})