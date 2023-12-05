/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";
import { sum } from "lodash";

const colorDecorator = (colors: any[], masterPlateTypes: any[]) => {
  return colors?.map((color: any) => {
    const colorFirstPlateType =
      (color?.plateType && color?.plateType[0]) ||
      (color?.plateTypes && color?.plateTypes[0]);
    const plateTypes = color.plateType || color.plateTypes;
    return {
      ...color,
      checkboxId: faker.datatype.uuid(),
      totalSets:
        (plateTypes &&
          plateTypes.length &&
          sum(plateTypes?.map((plate: any) => plate.sets))) ||
        0,
      plateType: plateTypes.map((colorPlateType: any) => {
        const selected = masterPlateTypes?.find(
          (plateType) => plateType?.value === colorPlateType?.plateTypeId,
        );
        const { plateThicknessDescription, plateThicknessId } =
          colorFirstPlateType;
        return {
          ...colorPlateType,
          checkboxId: faker.datatype.uuid(),
          plateTypeDescription: {
            ...selected,
            plateThicknessDescription,
            plateThicknessId,
          },
        };
      }),
      isActive: true,
    };
  });
};

const mapPlateTypes = (details: any) => {
  return details?.plateTypes?.map((plateType: any) => {
    const thickness = details?.plateThicknesses?.find(
      (thickness: any) =>
        thickness?.thicknessId === plateType?.plateThicknessId,
    );
    return {
      label: plateType?.plateTypeName,
      value: plateType?.plateTypeId,
      plateThicknessDescription: thickness?.thicknessDesc
        ? thickness?.thicknessDesc
        : details?.techSpec?.thicknessDesc,
      plateThicknessId: thickness?.thicknessId
        ? thickness?.thicknessId
        : details?.techSpec?.thicknessId,
      isActive: true,
    };
  });
};

function unique(arr, keyProps) {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join("|");
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}

const validation = (colour: any) => {
  const totalSets =
    colour.plateDetails &&
    colour.plateDetails.length &&
    sum(colour.plateDetails.map((plate: any) => plate.sets));
  const plateTypes =
    colour.plateDetails &&
    colour.plateDetails.map((plate: any) => plate.plateTypeId);
  const hasUniquePlates =
    colour.showComments ||
    !totalSets ||
    (totalSets && plateTypes.length === new Set(plateTypes).size); // - Check only if totalSets > 0
  const hasEmptyPlateDescription =
    colour.plateDetails.find(
      (plate: any) => plate.sets > 0 && !plate.plateTypeId,
    ) != null;
  const hasEmptyPlateThickness =
    colour.plateDetails.find(
      (plate: any) => plate.sets > 0 && !plate.plateThicknessId,
    ) != null;
  const distinctComments = unique(colour.plateDetails, [
    "plateTypeId",
    "comments",
  ]);
  console.log(distinctComments);
  const hasDistinctComments =
    !colour.showComments ||
    colour.plateDetails.length == distinctComments.length;
  const isValid =
    hasUniquePlates &&
    totalSets <= 10 &&
    !hasEmptyPlateDescription &&
    !hasEmptyPlateThickness &&
    hasDistinctComments;

  return {
    isValid,
    hasEmptyPlateDescription,
    hasUniquePlates,
    hasEmptyPlateThickness,
    hasDistinctComments,
  };
};

const flattenColors = (colors: any[] = []) => {
  const flattenedColors = [] as any[];
  colors?.length &&
    colors?.forEach((color: any) => {
      color.plateType = !color?.plateDetails
        ? color.plates
        : color.plateDetails;
      color?.plateType?.forEach((plate) => {
        flattenedColors.push({
          clientPlateColourRef: color.clientPlateColourRef,
          colourName: color.colourName,
          colourType: color.colourType,
          commonColourRef: color.commonColourRef,
          custCarrierIdNo: color.custCarrierIdNo,
          custImageIdNo: color.custImageIdNo,
          imageCarrierId: color.custImageIdNo
            ? color.custImageIdNo
            : color.custCarrierIdNo
            ? color.custCarrierIdNo
            : color.imageCarrierId,
          serialNumber: plate.serialNumber,
          isActive: true,
          isNew: color.isNew,
          jobTechSpecColourId: color.jobTechSpecColourId,
          newColour:
            color.newColour === undefined ? color.isNew : color.newColour,
          id: plate.id,
          plateTypeId: plate?.plateTypeId,
          plateTypeDescription: plate?.plateTypeDescription,
          plateThicknessId: plate?.plateThicknessId,
          plateThicknessDescription: plate?.plateThicknessDescription,
          comments: plate?.comments,
          sequenceNumber: color.sequenceNumber,
          sets: plate.sets,
        });
      });
    });
  return flattenedColors;
};

export { colorDecorator, mapPlateTypes, validation, flattenColors };
