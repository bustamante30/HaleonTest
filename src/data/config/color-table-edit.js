export default {
  dataKey: "checkboxId",
  sortBy: ["sequenceNumber"],
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
      header: "View Colour",
      field: "lenData",
      type: "lenimage",
      freeze: "left",
      width: 6,
    },
    {
      header: "Total Quantity",
      field: "totalSets",
      width: 5,
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
      field: "colourType",
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
    dataKey: "checkboxId",
    cols: [
      {
        header: "Plate Type",
        field: "plateTypeId",
        type: "lookup",
        options: { label: "plateTypeName", value: "plateTypeId" },
      },
      {
        header: "Plate Thickness (1/1000)",
        field: "plateThicknessId",
        type: "lookup",
        options: { label: "thicknessDesc", value: "thicknessId" },
      },
      {
        header: "Quantity",
        field: "sets",
        type: "edit-sets",
        max: 10,
        width: 5,
      },
    ],
  },
};
