import { testStore, Planet } from '../../index.test.config';
import * as _ from 'lodash'

describe('model should', () => {
  it('save when save() is called', async () => {
    const planet = await (new Planet('a', 0)).save()
    const id = planet.meta.id

    if (id == null) {
      throw Error('meta.id is null')
    }

    let searchedPlanet = await testStore.get(id)
    planet.name = 'b'
    await planet.save()

    searchedPlanet = await testStore.get(id)
    if (searchedPlanet == null) { throw Error('searchedPlanet is null.') }
    expect(searchedPlanet.name).toEqual('b')
  })

  it('delete when delete() is called', async () => {
    const newPlanet = await testStore.push(new Planet('a', 0))
    const id = newPlanet.meta.id
    await newPlanet.delete()

    if (id == null) {
      throw Error('meta.id is null.')
    }
    const searchedPlanet = await testStore.get(id)
    expect(searchedPlanet).toBeFalsy()
  })
})
