export default {
    cols: [
    {
        header: 'Client Colour Ref',
        field: 'clientPlateColourRef',
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
      header: 'Image Carrier ID #',
      field: 'imageCarrierId',
      freeze: 'left',
      width: 10
    },
     {
       header: 'Sets (Qty)',
       field: 'sets',
       type: 'number',
       freeze: 'center',
       width: 8
     },
  ]
}