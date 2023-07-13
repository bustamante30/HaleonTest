import { faker } from '@faker-js/faker'

function genLocations() {
  const count = faker.datatype.number({ min: 3, max: 100})
  const locations = []
  for (let i = 0; i < count; i++) {
    locations.push({
      id: faker.datatype.uuid(),
      name: faker.address.city()
    })
  }
  return locations
}

function genPrinter(i, isAdmin) {
  const locations = faker.datatype.number({ min: 3, max: 100 })
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name(),
    onboardedAt: faker.date.recent(),
    summary: {
      locations,
      admins: locations * faker.datatype.number({ min: 1, max: 3 }),
      users: locations * faker.datatype.number({ min: 3, max: 20 }),
      internalUsers: faker.datatype.number({ min: 3, max: 20 }),
      identityProvider: faker.helpers.arrayElement(['google', 'microsoft'])
    }
  }
}

function genPrinters(count, isAdmin) {
  const printers = []
  for (let i = 0; i < count; i++) {
    printers.push(genPrinter(i, isAdmin))
  }
  return printers
}

export { genLocations, genPrinters }
