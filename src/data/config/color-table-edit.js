export default {
  cols: [
    {
      header: "Seq #",
      field: "sequenceNumber",
      freeze: "left",
      width: 3,
    },
    {
      header: "Client Colour Ref",
      field: "clientPlateColourRef",
      freeze: "left",
      width: 6,
    },
    {
      header: "SGS Colour",
      field: "colourName",
      freeze: "left",
      width: 6,
    },
    {
      header: 'Plate Types',
      field: 'plateTypes',
      tooltip: true,
    },
    {
      header: 'Total Quantity',
      field: 'totalSets',
      width: 5
    },
    {
      header: "Printer Plate Code",
      field: "imageCarrierId",
      width: 6,
    },
    {
      header: "New/ Common",
      field: "isNew",
      width: 6,
    },
    {
      header: "Colour Type",
      field: "colourTypeDesc",
      freeze: "right",
      width: 6,
    },
    {
      header: "Common Ref",
      field: "commonColourRef",
      freeze: "right",
      width: 6,
    },
  ],
  plates: {
    cols: [
      {
        header: 'Plate Type',
        field: 'plateTypeDescription',
        type: 'lookup',
        options: { key: 'plateTypeDescription' },
      },
      {
        header: 'Plate Thickness',
        field: 'plateThicknessDescription',
        type: 'number',
        min: 0.25,
        max: 100,
        width: 10
      },
      {
        header: 'Quantity',
        field: 'sets',
        type: 'edit-sets',
        width: 5
      },
    ]
  },
};
