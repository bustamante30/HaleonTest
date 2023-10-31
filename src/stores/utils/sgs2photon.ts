interface OrderDetails {
  printerName: string | null;
  barcode: string | null;
  jobDetails: {
    packagingReference: string | null;
    variety: string | null;
  };
  techSpec: {
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
    plateTypeId: string | null;
  };
  pdfData: string | null;
}

const mapSgsOrderDetail = (details: OrderDetails) => {
  return {
    printerName: details.printerName != "" ? details.printerName : null,
    barcodes: details.barcode,
    packagingReference: details.jobDetails.packagingReference,
    /*
    cust1UpDie: details.techSpec.cust1UpDie,
    printProcess: details.techSpec.printProcessDescription,
    substrate: details.techSpec.substrate,
    surfaceReverseSprint: details.techSpec.surfaceReversePrint,
    plateRelief: details.techSpec.plateRelief,
    plateThickness: details.techSpec.thicknessDesc,
    numberAcrossCylinder: details.techSpec.numberAcrossCylinder,
    numberAroundCylinder: details.techSpec.numberAroundCylinder,
    dispro: details.techSpec.dispro,
    plateType: details.techSpec.plateType,
    plateTypeId: details.techSpec.plateTypeId,
    */
    pdfData: details.pdfData,
    variety: details.jobDetails.variety,
    thumbNailPath: new URL("@/assets/images/no_thumbnail.png", import.meta.url)
      .pathname,
    isActive: true,
  };
};

export { mapSgsOrderDetail };
