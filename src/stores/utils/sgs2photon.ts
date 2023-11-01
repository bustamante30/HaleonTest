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
    pdfData: details.pdfData,
    variety: details.jobDetails.variety,
    thumbNailPath: new URL("@/assets/images/no_thumbnail.png", import.meta.url)
      .pathname,
    isActive: true,
  };
};

export { mapSgsOrderDetail };
