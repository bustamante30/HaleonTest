function filterConfig(role) {
  return {
    sections: [
      {
        name: 'itemCode',
        filters: [
          {
            name: 'itemCode',
            label: 'Item Code',
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
            label: 'Printer Name',
            short: 'Printer',
            disabled: role === 'user'
          },
          {
            name: 'printerLocation',
            label: 'Printer Location',
            short: 'Location',
            type: 'select',
            options: 'locations',
          },
          {
            name: 'packagingReference',
            label: 'Packaging Reference',
            short: 'Ref',
          },
        ]
      },
      {
        name: 'imageCarrier',
        label: 'Image Carrier',
        filters: [
          {
            name: 'imageCarrierId',
            label: 'Image Carrier Id',
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
