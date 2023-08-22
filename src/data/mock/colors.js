import { faker } from '@faker-js/faker'


function generateColor(i) {
  const refIdSuffix = faker.datatype.boolean()
    ? faker.helpers.arrayElement(['-1', '-2'])
    : ''
  return {
    id: faker.datatype.uuid(),
    colour: faker.helpers.arrayElement(['Cyan', 'Magenta', 'Yellow', 'Black', 'Pantone 2145 C', 'Pantone 281 C', 'Spot Varnish']),
    imageId: faker.datatype.number({ min: 10000, max: 999999}) + refIdSuffix,
    serialNumber: faker.datatype.number({ min: 10000, max: 999999}),
    sets: faker.datatype.number({ min: 1, max: 10 }),
  }
}

function generateColors(count) {
  const jobs = []
  for (let i = 0; i < count; i++) {
    jobs.push(generateColor(i))
  }
  return jobs
}

export default generateColors(8)


// Validation plate type dropdown should be visible when validation fail - done
// Plate thickness changes - done
// checkbox selection on adding sets +
// Adding new row set to 1 in validation 10 -


// Add to cart button should be disabled when validation fail
// View cart width 
// Plate type and thickness in add to cart

// Updatedraft api check
// Quantity changes from Api
