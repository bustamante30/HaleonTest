const mapSgsOrderDetail = (details: any = {}) => {
  return {
    printerName: details.printerName != "" ? details.printerName : null,
    // Bug -203039 - Get API is not returning full description so using description from Search api as such .
    // description: details.jobDescription;
    barcodes: details.barcode,
    packagingReference: details.jobDetails.packagingReference,
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
    pdfData: details.pdfData,
    variety: details.jobDetails.variety,
    thumbNailPath: new URL("@/assets/images/no_thumbnail.png", import.meta.url).pathname,
    isActive: true,
  }
}

export { mapSgsOrderDetail }
