export default {
  cols: [
    {
      header: 'Client Colour Ref',
      field: 'clientPlateColourRef',
      freeze: 'left',
      width: 12
    },
    {
      header: 'SGS Colour',
      field: 'colourName',
      freeze: 'left',
      width: 12
    },
    {
      header: 'Image Carrier ID #',
      field: 'imageCarrierId',
      freeze: 'left',
    },
    {
      header: 'Sets (Qty)',
      field: 'sets',
      type: 'edit-sets',
      freeze: 'center',
      width: 18
    },
  ]
}