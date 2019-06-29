import { testCreateRandomPlanets, testStore, Planet } from "../../index.test.config";
import _ from 'lodash'
import { GetOperation } from '../..';

describe('GET operation', () => {
  describe('gets', () => {
    describe('all elements', async () => {
      it('through GetOperation', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await new GetOperation(testStore).run()

        expect(received).toHaveLength(data.length)
      })

      it('through Datastore', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.getItems()

        expect(received).toHaveLength(data.length)
      })
    })

    describe('single element', async () => {
      it('through GetOperation', async () => {
        const index = 55
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await new GetOperation(testStore)
          .filter((planet) => planet.index == index)
          .first()
        expect(received).toEqual(data[index])
      })

      it('through Datastore', async () => {
        const index = 55
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.getItems({ filter: (v) => v.index === index })
        expect(received[0]).toEqual(data[index])
      })
    })

    describe('five elements', () => {
      it('through GetOperation', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await new GetOperation(testStore)
          .filter((planet) => planet.index >= 0 && planet.index < 5)
          .run()

        received.sort((a, b) => a.index - b.index)
        const dataSplit = data.slice(0, 5)
        expect(received).toEqual(dataSplit)
      })

      it('through Datastore', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const received = await testStore.getItems({ filter: (planet) => planet.index >= 0 && planet.index < 5 })
        received.sort((a, b) => a.index - b.index)
        const dataSplit = data.slice(0, 5)
        expect(received).toEqual(dataSplit)
      })
    })

    describe('non-existent item', () => {
      it('through GetOperation', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const firstPlanet = data[0]
        const received = await new GetOperation(testStore).id(firstPlanet.meta.id + '1').first()
        expect(received).toEqual(null)
      })

      it('through Datastore', async () => {
        const data: Planet[] = await testCreateRandomPlanets(true)
        const firstPlanet = data[0]
        const received = await testStore.get(firstPlanet.meta.id + '1')
        expect(received).toEqual(null)
      })
    })
  })
})

