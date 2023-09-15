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
        width: 10
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
  actions: (order,userType,role) => {
    switch(order.statusId){
      case null:
        return [
          { icon: 'add', label: 'Add to Cart', event: 'add' },
          { icon: 'redo', label: 'Order Again', event: 'reorder' }
        ]
      case 2:
        let actions = []
        if(userType!=='INT')
          actions.push( { icon: 'backspace', label: 'Cancel Order', event: 'cancel', validate : true, field:'submittedDate' })

        if(userType ==='INT' || (userType ==='EXT' && role === 'PrinterAdmin'))
          actions.push( { icon: 'visibility', label: 'Audit', event: 'audit' })
        
        return actions
      case 3:
          if(userType ==='INT' || (userType ==='EXT' && role === 'PrinterAdmin'))
            return[{ icon: 'visibility', label: 'Audit', event: 'audit' }]

      case 1:
          if(userType ==='INT' || (userType ==='EXT' && role === 'PrinterAdmin'))
            return[{ icon: 'visibility', label: 'Audit', event: 'audit' }]
      default:
        return []
    }
    return []
  }
}