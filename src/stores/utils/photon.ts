const mapPhotonOrderDetail = (
  shirttailDetails: any = {},
  barcodeDetails: any = {},
) => {
  return {
    cust1UpDie: shirttailDetails?.cust1UpDie,
    printProcess: shirttailDetails?.printProcessDescription,
    substrate: shirttailDetails?.substrate,
    surfaceReverseSprint: shirttailDetails?.surfaceReversePrint,
    plateRelief: shirttailDetails?.plateRelief,
    plateThickness: shirttailDetails?.thicknessDesc,
    numberAcrossCylinder: shirttailDetails?.numberAcrossCylinder,
    numberAroundCylinder: shirttailDetails?.numberAroundCylinder,
    dispro: shirttailDetails?.dispro,
    plateType: shirttailDetails?.plateType,
    barcodes: barcodeDetails,
    isActive: true,
  };
};

const mapColorPlateTypes = (colors: any[]) => {
  const plateTypes = [] as any[];
  colors?.forEach((color: any) => {
    color?.plateTypes?.forEach((plateType: any) => {
      console.log("plateType", plateType);
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
