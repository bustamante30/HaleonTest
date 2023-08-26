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





// Updatedraft api check

// Count need to handled from ui cart length ?
// Update Cart? 
// Colors quantity not getting updated?

// Remove from cart on successful reorder?
// Retrieve data for submitted draft and cancelled?
// DB photon clearing part

// Add to cart from table action, table header (multiple)
// View order in cart details not showing
