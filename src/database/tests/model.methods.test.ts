import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import { SortDirection } from "../sort/sort.types";
import * as _ from 'lodash'

describe('model should', () => {
  it('save when save() is called', async () => {
    const planet = await testStore.create(new Planet('a', 0))
    await planet.save()
    const id = planet.meta.id
    
    let searchedPlanet = await testStore.get().id(id).one()
    planet.name = 'b'
    await planet.save()
    
    searchedPlanet = await testStore.get().id(id).one()
    expect(searchedPlanet.name).toEqual('b')
  })
  it('delete when delete() is called', async () => {
    const newPlanet = await testStore.pushItem(new Planet('a', 0))
    const id = newPlanet.meta.id
    await newPlanet.delete()
    const searchedPlanet = await testStore.get().id(id).one()
    expect(searchedPlanet).toEqual(null)
  })
})