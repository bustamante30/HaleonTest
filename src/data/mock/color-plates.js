import { faker } from '@faker-js/faker'
import {  } from 'lodash'

function generatePlates(plateTypes) {
  const count = faker.datatype.number({ min: 1, max: 4 })
  const colorPlateTypes = faker.helpers.arrayElements(plateTypes, count)
  const plateThicknesses = plateTypes.map(() => faker.datatype.number({ min: 2.5, max: 100 }) / 100)
  const sets = plateTypes.map(() => faker.datatype.number({ min: 1, max: 5 }))
  return {
    plateDetails: colorPlateTypes.map((type, i) => ({
      id: type.value,
      plateType: plateTypes[i],
      plateThickness: plateThicknesses[i],
      sets: sets[i]
    }))
  }
}

function generateColor(i, plateTypes) {
  const refIdSuffix = faker.datatype.boolean()
    ? faker.helpers.arrayElement(['-1', '-2'])
    : ''
  const plates = generatePlates(plateTypes)
  return {
    id: faker.datatype.uuid(),
    sequence: i + 1,
    colour: faker.helpers.arrayElement(['Cyan', 'Magenta', 'Yellow', 'Black', 'Pantone 2145 C', 'Pantone 281 C', 'Spot Varnish']),
    colourType: faker.helpers.arrayElement(['Tone', 'Line']),
    imageId: faker.datatype.number({ min: 10000, max: 999999}) + refIdSuffix,
    serialNumber: faker.datatype.number({ min: 10000, max: 999999 }),
    ...plates
  }
}

function generateColors(count, plateTypes) {
  const jobs = []
  for (let i = 0; i < count; i++) {
    jobs.push(generateColor(i, plateTypes))
  }
  return jobs
}

export { generateColors }
