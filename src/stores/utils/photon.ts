interface PlateType {
  label: string;
  value: string;
  plateThicknessDescription: string;
  plateThicknessId: string;
  isActive: boolean;
}

interface ShirttailDetails {
  cust1UpDie: string | null;
  printProcessDescription: string | null;
  substrate: string | null;
  surfaceReversePrint: string | null;
  plateRelief: string | null;
  thicknessDesc: string | null;
  numberAcrossCylinder: number | null;
  numberAroundCylinder: number | null;
  dispro: string | null;
  plateType: string | null;
}

const mapPhotonOrderDetail = (
  shirttailDetails: ShirttailDetails,
  barcodeDetails = {},
  order: unknown = null,
) => {
  if (!order) {
    return {
      cust1UpDie: shirttailDetails?.cust1UpDie || null,
      printProcess: shirttailDetails?.printProcessDescription || null,
      substrate: shirttailDetails?.substrate || null,
      surfaceReverseSprint: shirttailDetails?.surfaceReversePrint || null,
      plateRelief: shirttailDetails?.plateRelief || null,
      plateThickness: shirttailDetails?.thicknessDesc || null,
      numberAcrossCylinder: shirttailDetails?.numberAcrossCylinder || null,
      numberAroundCylinder: shirttailDetails?.numberAroundCylinder || null,
      dispro: shirttailDetails?.dispro || null,
      plateType: shirttailDetails?.plateType || null,
      barcodes: barcodeDetails || null,
      isActive: true,
    };
  } else {
    order["cust1UpDie"] = shirttailDetails?.cust1UpDie || null;
    order["printProcess"] = shirttailDetails?.printProcessDescription || null;
    order["substrate"] = shirttailDetails?.substrate || null;
    order["surfaceReverseSprint"] =
      shirttailDetails?.surfaceReversePrint || null;
    order["plateRelief"] = shirttailDetails?.plateRelief || null;
    order["plateThickness"] = shirttailDetails?.thicknessDesc || null;
    order["numberAcrossCylinder"] =
      shirttailDetails?.numberAcrossCylinder || null;
    order["numberAroundCylinder"] =
      shirttailDetails?.numberAroundCylinder || null;
    order["dispro"] = shirttailDetails?.dispro || null;
    order["plateType"] = shirttailDetails?.plateType || null;
    order["barcodes"] = barcodeDetails || null;
    order["isActive"] = true;
  }
};

const mapColorPlateTypes = (colors) => {
  const plateTypes: PlateType[] = [];
  colors?.forEach((color) => {
    color?.plateTypes?.forEach((plateType) => {
      plateTypes.push({
        label: plateType?.plateTypeDescription,
        value: plateType?.plateTypeId,
        plateThicknessDescription: plateType?.plateThicknessDescription,
        plateThicknessId: plateType?.plateThicknessId,
        isActive: true,
      });
    });
  });
  return plateTypes;
};

const normalizeAndReplaceBlobName = (str) => {
  const normalizedStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
  const result = normalizedStr.replace(/[^a-zA-Z0-9\s.-]/g, "_"); // Replace non-alphanumeric characters with underscores
  return result;
};

export {
  mapPhotonOrderDetail,
  mapColorPlateTypes,
  normalizeAndReplaceBlobName,
};
