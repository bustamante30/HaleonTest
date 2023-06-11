function filterConfig(role) {
  return {
    sections: [
      {
        name: 'itemCode',
        filters: [
          {
            name: 'itemCode',
            label: 'Item Number',
            short: 'Item',
          },
          {
            name: 'orderDate',
            label: 'Order Date',
            short: 'Ordered',
            type: 'daterange'
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
            name: 'printerLocation',
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
            name: 'previousPONumber',
            label: 'Previous PO Number',
          },
          {
            name: 'sGSReferenceNumber',
            label: 'SGS Reference Number',
          },
        ]
      },
      {
        name: 'imageCarrier',
        label: 'Image Carrier',
        filters: [
          {
            name: 'imageCarrierId',
            label: 'Printer Plate Code',
            short: 'Carrier Id',
          },
          {
            name: 'imageCarrierCode',
            label: 'Image Carrier Code',
            short: 'Carrier Code',
            type: 'imageCarrierCodeType',
            options: 'imageCarrierCodeTypes'
          },
        ]
      }
    ]
  }
}

export { filterConfig }
