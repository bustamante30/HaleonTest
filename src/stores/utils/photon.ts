const mapPhotonOrderDetail = (shirttailDetails: any = {}, barcodeDetails: any = {}) => {
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
  }
}

export { mapPhotonOrderDetail }
