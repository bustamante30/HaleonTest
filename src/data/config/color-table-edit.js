export default {
  cols: [
    {
      header: 'Client Colour Ref',
      field: 'clientPlateColourRef',
      freeze: 'left',
      width: 8
    },
    {
        header: 'Sequence Number',
        field: 'colourOrder',
        freeze: 'left',
        width: 8
    },
    {
      header: 'SGS Colour',
      field: 'colourName',
      freeze: 'left',
      width: 12
    },
    {
      header: 'Printer Plate Code',
      field: 'imageCarrierId',
      freeze: 'left',
    },
    {
      header: 'Quantity',
      field: 'sets',
      type: 'edit-sets',
      freeze: 'center',
      width: 18
    },
  ]
}