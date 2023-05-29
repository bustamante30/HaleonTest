export default {
  cols: [
    {
      header: 'Plate Colour(s)',
      field: 'colour',
      freeze: 'left',
      width: 12
    },
    {
      header: 'Image Carrier ID #',
      field: 'imageId',
      freeze: 'left',
    },
    {
      header: 'Number of Sets',
      field: 'sets',
      type: 'edit-sets',
      width: 18
    },
  ]
}