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

const mapPlateTypes = (details: any) => {
  return details?.plateTypes?.map((plateType: any) => {
    const thickness = details?.plateThicknesses?.find((thickness: any) => thickness?.thicknessId === plateType?.plateTypeId)
    return {
      label: plateType?.plateTypeName,
      value: plateType?.plateTypeId,
      plateThicknessDescription: thickness?.thicknessDesc ? thickness?.thicknessDesc : details?.techSpec?.thicknessDesc,
      plateThicknessId: thickness?.thicknessId ? thickness?.thicknessId : details?.techSpec?.thicknessId,
      isActive: true
    }
  })
}

const validation = (colour: any) => {
  const totalSets = colour.plateType && colour.plateType.length && sum(colour.plateType.map((plate: any) => plate.sets))        
  const plateTypes = colour.plateType && colour.plateType.map((plate: any) => plate.plateTypeDescription.value) 
  const hasUniquePlates = !totalSets || (totalSets && plateTypes.length === new Set(plateTypes).size) // - Check only if totalSets > 0
  const hasMixed = colour.plateType && colour.plateType.find((plate: any) => plate.sets > 0 && plate.plateTypeDescription.value === 256)  // 256 = Mixed plateTypeId
  const hasEmptyPlateDescription = colour.plateType && colour.plateType.find((plate: any) => plate.sets > 0 && !plate.plateTypeDescription.value)  // 256 = Mixed plateTypeId
  const isValid = hasUniquePlates && totalSets <= 10 && !hasMixed && !hasEmptyPlateDescription
  console.log({ isValid, hasEmptyPlateDescription, hasMixed, hasUniquePlates })
  return { isValid, hasEmptyPlateDescription, hasMixed, hasUniquePlates }
}

export { colorDecorator, mapPlateTypes, validation }
