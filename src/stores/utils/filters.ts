const newFilterProps = (printerName = null) => {
  return {
    query: "",
    status: 4,
    itemNumber: null,
    orderDate: [],
    printerName,
    printerSite: null,
    printerReference: null,
    poNumber: null,
    barcodeNumber: null,
    sgsReferenceNumberList: null,
    imageCarrierId: null,
    imageCarrierCode: null,
    printerPlateCode: null,
    startDate: [],
  };
};

export { newFilterProps };
