import { faker } from '@faker-js/faker';
import { sum } from 'lodash';

const colorDecorator = (colors: any[], masterPlateTypes: any[]) => {
  return colors?.map((color: any) => {
    const colorFirstPlateType = color?.plateType && color?.plateType[0] || color?.plateTypes && color?.plateTypes[0]
    const plateTypes = color.plateType || color.plateTypes
    return {
      ...color,
      checkboxId: faker.datatype.uuid(),
      totalSets: plateTypes && plateTypes.length && sum(plateTypes?.map((plate: any) => plate.sets)) || 0,
      plateType: plateTypes.map((colorPlateType: any) => {
        const selected = masterPlateTypes?.find(plateType => plateType?.value === colorPlateType?.plateTypeId)
        const { plateThicknessDescription, plateThicknessId } = colorFirstPlateType
        return {
          ...colorPlateType,
          checkboxId: faker.datatype.uuid(),
          plateTypeDescription: { ...selected, plateThicknessDescription, plateThicknessId }
        }
      }),
      isActive: true
    }
  })
}

export { colorDecorator }
