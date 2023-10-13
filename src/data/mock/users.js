import { faker } from "@faker-js/faker";

function genUser(i, printerName, locations, isAdmin) {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    id: faker.datatype.uuid(),
    firstName,
    lastName,
    location: faker.helpers.arrayElement(locations),
    isAdmin,
    // isPrimaryPM,
    email: `${firstName}.${lastName}@${printerName || ""}.com`
      .replace(/and/gi, "")
      .replace(/[,\s'-]/gi, "")
      .toLowerCase(),
  };
}

function genUsers(count, printerName, locations, isAdmin) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(genUser(i, printerName, locations, isAdmin));
  }
  return users;
}

export { genUsers };
