import { faker } from '@faker-js/faker'
const brands = [
  { id: faker.datatype.uuid(), code: 'coca-cola', name: 'Coca-cola', logo: '/brands/coca-cola.png' },
  { id: faker.datatype.uuid(), code: 'nike', name: 'Nike', logo: '/brands/nike.png' },
  { id: faker.datatype.uuid(), code: 'unilever', name: 'Unilever', logo: '/brands/unilever.png' },
  { id: faker.datatype.uuid(), code: 'hersleys', name: 'Hersley\'s', logo: '/brands/hershey.png' },
  { id: faker.datatype.uuid(), code: 'pepsico', name: 'PepsiCo', logo: '/brands/pepsico.png' },
  { id: faker.datatype.uuid(), code: 'kraft-heinz', name: 'Kraft - Heinz', logo: '/brands/kraft-heinz.png' },
]

function generateOrder(i) {
  const refIdSuffix = faker.datatype.boolean()
    ? faker.helpers.arrayElement(['-1', '-2'])
        : ''
    const colour =
    { clientPlateColourRef: 'CMYK100', colourName: 'Black', imageCarrierId: "992-1" }
    const barcode =
    { barcodeNumber: "12234", barcodeTypeDesc: 'UPC-A'}
    const colours = Array.from([colour])
    const barcodes = Array.from([barcode])
  return {
    id: faker.datatype.uuid(),
    preview: faker.datatype.boolean(),
    select: faker.datatype.boolean(),
    orderDate: faker.date.recent(),
    brandName: faker.helpers.arrayElement(brands.map(b => b.name)),
    name: faker.helpers.arrayElement(['Kraft Singles Cheese', 'Mac and Cheese Thick', 'Singles Cold Box', 'Sun Dried Tomato Vinaigette', 'Maggi']),
    thumbNailPath: faker.helpers.arrayElement(['https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg','https://primefaces.org/cdn/primevue/images/galleria/galleria9.jpg', 'https://primefaces.org/cdn/primevue/images/galleria/galleria8.jpg', 'https://primefaces.org/cdn/primevue/images/galleria/galleria7.jpg', 'https://primefaces.org/cdn/primevue/images/galleria/galleria6.jpg']),
    weight: faker.datatype.number({ min: 100, max: 999 }) + ' g',
    itemCode: faker.datatype.number({ min: 10000, max: 999999 }) + refIdSuffix,
    printerName: faker.helpers.arrayElement(['Winpak Pekin', 'ABC Inc', 'QR Express Print']),
    printerLocation: faker.helpers.arrayElement(['Lancaster', 'Concord NH', 'Neenah, WI']),
    packType: faker.helpers.arrayElement(['Shink Sleeve', 'Carton', 'Front Label']),
    mySGSNumber: 'NA',
    description: '',
    colors: colours,
    barcodes: barcodes,
    printProcess:"",
    substrate:"",
    surfaceReverseSprint:"",
    plateThickness:"",
    plateRelief:"",
    numberAroundCylinder: 0,
    numberAcrossCylinder:0,
    dispro: 0,
    cust1UpDie:"",
    plateType: "",
      customerContacts: faker.helpers.arrayElement([{ shippingAddres: 'test address' }, { shippingAddres: 'test address2' }])
  }
}

function generateOrders(count) {
  const jobs = []
  for (let i = 0; i < count; i++) {
    jobs.push(generateOrder(i))
  }
  return jobs
}

export default generateOrders(10)
