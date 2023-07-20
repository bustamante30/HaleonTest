const config = {
  sections: [
{
  label: 'Product Details',
  fields: [
    { label: 'Print Process', name: 'printProcess' },
    { label: 'Cust.1-Up Die', name: 'cust1UpDie' },
    { label: 'Product Desc', name: 'description' },
    { label: 'Surface/Reverse/Both', name: 'surfaceReverseSprint' },
    { label: 'Plate Type', name: 'plateType' },
    { label: 'Plate Thickness', name: 'plateThickness' },
    { label: 'Plate Relief ', name: 'plateRelief' },
    { label: 'Number Around Cylinder', name: 'numberAroundCylinder' },
    { label: 'Number Across Cylinder', name: 'numberAcrossCylinder' },
    { label: 'Dispro %', name: 'dispro' },
    { label: 'Substrate', name: 'substrate' },
  ]
},
{
  label: 'Barcodes',
  type: 'barcodes',
  tableConfig: {
    cols: [
      { name: 'barcodeNumber', label: 'Barcode Number', width: 12 },
      { name: 'barcodeTypeDesc', label: 'Barcode Type', width: 5 },
    ]
  },
}]}


export { config }
