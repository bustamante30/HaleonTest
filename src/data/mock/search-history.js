import { faker } from '@faker-js/faker'

const brands = [
  { id: faker.datatype.uuid(), code: 'coca-cola', name: 'Coca-cola', logo: '/brands/coca-cola.png' },
  { id: faker.datatype.uuid(), code: 'nike', name: 'Nike', logo: '/brands/nike.png' },
  { id: faker.datatype.uuid(), code: 'unilever', name: 'Unilever', logo: '/brands/unilever.png' },
  { id: faker.datatype.uuid(), code: 'hersleys', name: 'Hersley\'s', logo: '/brands/hershey.png' },
  { id: faker.datatype.uuid(), code: 'pepsico', name: 'PepsiCo', logo: '/brands/pepsico.png' },
  { id: faker.datatype.uuid(), code: 'kraft-heinz', name: 'Kraft - Heinz', logo: '/brands/kraft-heinz.png' },
]

const history = []

const genSearchItem = (i) => {
  const brand = faker.helpers.arrayElement(brands.map(b => b.name))
  const brandKeyword = brand.split(' ')[0]
  const description = faker.helpers.arrayElement(['Kraft Singles Cheese', 'Mac and Cheese Thick', 'Singles Cold Box', 'Sun Dried Tomato Vinaigette', 'Maggi'])
  const descriptionKeywords = faker.helpers.arrayElements(description.split(' '))
  return {
    brand,
    description,
    weight: faker.datatype.number({ min: 100, max: 999 }) + ' g',
    packType: faker.helpers.arrayElement(['Shink Sleeve', 'Carton', 'Front Label']),
    keywords: [brandKeyword, ...descriptionKeywords].join(', ')
  }
}

const genHistory = () => {
  const count = 30
  for (let i = 0; i <= count; i++) {
    history.push(genSearchItem(i))
  }
}

genHistory()

export { history }