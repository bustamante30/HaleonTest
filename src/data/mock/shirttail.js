import { faker } from "@faker-js/faker";

const locations = ["Lancaster", "Concord NH", "Neenah, WI"];
const processes = ["Flexo", "Litho", "Gravure", "Dry Offset", "ITR Sleeve"];

const brands = [
  {
    id: faker.datatype.uuid(),
    code: "coca-cola",
    name: "Coca-cola",
    logo: "/brands/coca-cola.png",
  },
  {
    id: faker.datatype.uuid(),
    code: "nike",
    name: "Nike",
    logo: "/brands/nike.png",
  },
  {
    id: faker.datatype.uuid(),
    code: "unilever",
    name: "Unilever",
    logo: "/brands/unilever.png",
  },
  {
    id: faker.datatype.uuid(),
    code: "hersleys",
    name: "Hersley's",
    logo: "/brands/hershey.png",
  },
  {
    id: faker.datatype.uuid(),
    code: "pepsico",
    name: "PepsiCo",
    logo: "/brands/pepsico.png",
  },
  {
    id: faker.datatype.uuid(),
    code: "kraft-heinz",
    name: "Kraft - Heinz",
    logo: "/brands/kraft-heinz.png",
  },
];

const varieties = [
  { value: "APPLE", label: "Apple" },
  { value: "AVOCADO", label: "Avocado" },
  { value: "BANANA", label: "Banana" },
  { value: "BLACKBERRY", label: "Blackberry" },
  { value: "CHERRY", label: "Cherry" },
  { value: "COCONUT", label: "Coconut" },
  { value: "GRAPES", label: "Grapes" },
  { value: "KIWI", label: "Kiwi" },
  { value: "LEMON", label: "Lemon" },
  { value: "MANGO", label: "Mango" },
  { value: "MELON", label: "Melon" },
  { value: "ORANGE", label: "Orange" },
  { value: "PAPAYA", label: "Papaya" },
  { value: "PEACH", label: "Peach" },
  { value: "PEAR", label: "Pear" },
  { value: "PINEAPPLE", label: "Pineapple" },
  { value: "POMEGRANATE", label: "Pomegranate" },
  { value: "RASPBERRY", label: "Raspberry" },
  { value: "STRAWBERRY", label: "Strawberry" },
  { value: "WATERMELON", label: "Watermelon" },
];

function generateCustomers() {
  return [
    { name: "One Coca-Cola Plaza, GA", brand: "coca-cola" },
    { name: "The Kraft Heinz Company", brand: "kraft-heinz" },
    { name: "Unilever Blackfriars, London", brand: "unilever" },
    { name: "PepsiCo Beverages North America(PBNA)", brand: "pepsico" },
    { name: "PepsiCo International - UK & Ireland", brand: "pepsico" },
  ].map((customer) => {
    const brand = brands.find((brand) => brand.code === customer.brand);
    return {
      id: faker.datatype.uuid(),
      ...customer,
      brand,
    };
  });
}

function generateBarcode(index) {
  return {
    number: faker.datatype.number({ min: 100000000000, max: 999999999999 }),
    type: "UPC-A",
    magPercent: faker.datatype.number({ min: 10, max: 99 }) + "%",
    bwr: "0.0025",
    nbw: '0.011"',
  };
}

function generateBarcodes(count) {
  return new Array(count).fill(null).map((i) => generateBarcode(i));
}

const customers = generateCustomers();
const customer = faker.helpers.arrayElement(customers);
const variety = faker.helpers.arrayElement(varieties);

const shirttail = {
  order: {
    jobNumber: faker.datatype.number({ min: 10000, max: 99999 }),
    endUserRef: customer.name,
  },
  contact: {
    primarySiteLocation: faker.helpers.arrayElement(locations),
    primaryProjectManager: `${faker.name.firstName()} ${faker.name.lastName()}`,
    primaryEndUser: `${faker.name.firstName()} ${faker.name.lastName()}`,
  },
  techSpec: {
    printProcess: faker.helpers.arrayElement(processes),
    description: `${customer.name}; ${customer.brand.name}; ${variety}; `,
    custOneUpDie: "456",
    acrossCylinder: faker.datatype.number({ min: 10, max: 20 }),
    aroundCylinder: faker.datatype.number({ min: 10, max: 20 }),
    cylinderSize: "-",
    surfaceReverse: faker.helpers.arrayElement(["Surface", "Reverse", "Both"]),
    substrate: "Cellulose Fiber",
    disproPercent: faker.datatype.number({ min: 10, max: 99 }) + "%",
  },
  colour: {
    count: faker.datatype.number({ min: 5, max: 12 }),
  },
  barcodes: generateBarcodes(6),
};

export { shirttail };
