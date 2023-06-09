export default {
    cols: [
      {
        header: 'Thumbnail',
        field: 'image',
        type: 'image',
        width: 12
      },
      {
        header: 'Brand Name',
        field: 'brandName',
        width: 18
      },
      {
        header: 'Project Description',
        field: 'name',
        type: 'link',
        path: '/dashboard/$1',
        pathParams: ['id'],
        freeze: 'left',
      },
      {
        header: 'Order Date',
        field: 'orderDate',
        type: 'date',
        width: 15
      },
      {
        header: 'Product Weight',
        field: 'weight',
        width: 12
      },
      {
        header: 'Item Code',
        field: 'itemCode',
        width: 12
      },
      {
        header: 'Printer Name',
        field: 'printerName',
        width: 10
      },
      {
        header: 'Printer Location',
        field: 'printerLocation',
        width: 12
      },
      {
        header: 'Pack Type',
        field: 'packType',
        width: 12
      },
      {
        header: 'My SGS Job #',
        field: 'mySGSNumber',
        width: 12
      },
  ],
  actions: (order) => {
    return [
      // { icon: 'gps_fixed', label: 'Track Order', event: 'track' },
      { icon: 'redo', label: 'Order Again', event: 'reorder' },
      { icon: 'backspace', label: 'Cancel Order', event: 'cancel' },
      // { icon: 'edit', label: 'Update Order', event: 'edit' }
    ]
  }
}