function filterConfig(role) {
  return {
    sections: [
      {
        name: 'itemCode',
        filters: [
          {
            name: 'itemNumber',
            label: 'Item Number',
            short: 'Item',
          },
          {
            name: 'startDate',
            label: 'Order Date',
            short: 'Ordered',
            type: 'date'
          }
        ],
      },
      {
        name: 'printer',
        label: 'Printer',
        filters: [
          {
            name: 'printerName',
            label: '*Printer Name',
            short: 'Printer',
            disabled: role === 'user'
          },
          {
            name: 'printerSite',
            label: '*Shipping Location',
            short: 'Location',
            type: 'printerLoc',
            options: 'locations',
          },
          {
            name: 'packagingReference',
            label: 'Printer Reference Number',
            short: 'Ref',
          },
          {
            name: 'poNumber',
            label: 'Previous PO Number',
          },
          {
              name: 'sgsReferenceNumberList',
            label: 'SGS Reference Number',
          },
        ]
      },
      {
        name: 'imageCarrier',
        label: 'Image Carrier',
        filters: [
          {
            name: 'printerPlateCode',
            label: 'Printer Plate Code',
            short: 'Carrier Id',
          },
          {
            name: 'barcodeNumber',
            label: 'Code',
          },
        ]
      }
    ]
  }
}

export { filterConfig }
