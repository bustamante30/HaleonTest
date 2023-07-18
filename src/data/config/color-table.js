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
      width: 8
    },
    {
        header: 'Printer Plate Code',
      field: 'imageCarrierId',
      freeze: 'left',
      width: 10
    },
     {
       header: 'Quantity',
       field: 'sets',
       type: 'number',
       freeze: 'center',
       width: 8
     },
  ]
}