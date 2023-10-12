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
) => {
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

export { mapPhotonOrderDetail, mapColorPlateTypes };
