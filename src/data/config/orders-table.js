export default {
    cols: [
      {
        header: 'Thumbnail',
        field: 'thumbNailPath',
        type: 'image',
        width: 12
      },
      {
        header: 'Brand Name',
        field: 'brandName',
        width: 15
      },
      {
        header: 'Product Description',
        field: 'description',
        type: 'link',
        path: '/dashboard/$1',
        pathParams: ['sgsId'],
        freeze: 'left',
        width: 10,
        title: true
      },
      {
        header: 'Order Date',
        field: 'submittedDate',
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
        width: 5
      },
      {
        header: 'Printer Name',
        field: 'printerName',
        width: 10
      },
      {
        header: 'Printer Location',
        field: 'printerLocationName',
        width: 12
      },
      {
        header: 'Pack Type',
        field: 'packType',
        width: 12
      },
      {
        header: 'My SGS Job #',
        field: 'sgsId',
        width: 12
      },
      {
        header: 'Status',
        field: 'orderStatus',
        width: 5
      }
  ],
  actions: (order,userType) => {
    switch(order.statusId){
      case null:
        return [
          { icon: 'add', label: 'Add to Cart', event: 'add' },
          { icon: 'redo', label: 'Order Again', event: 'reorder' }
        ]
      case 2:
        if(userType!=='INT')
          return [
            { icon: 'backspace', label: 'Cancel Order', event: 'cancel', validate : true, field:'submittedDate' },
          ]
      default:
        return []
    }
    return []
  }
}