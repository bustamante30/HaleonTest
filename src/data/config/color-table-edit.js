export default {
  cols: [
    {
      header: "Sequence #",
      field: "sequenceNumber",
      freeze: "left",
      width: 6,
    },
    {
      header: "Client Colour Ref",
      field: "clientPlateColourRef",
      freeze: "left",
      width: 8,
    },
    {
      header: "SGS Colour",
      field: "colourName",
      freeze: "left",
      width: 12,
    },
    {
      header: "Printer Plate Code",
      field: "imageCarrierId",
      freeze: "left",
      width: 8,
    },
    {
      header: "Quantity",
      field: "sets",
      type: "edit-sets",
      freeze: "center",
      width: 10,
    },
    {
      header: "Colour Type",
      field: "colourTypeDesc",
      freeze: "center",
      width: 7,
    },
    {
      header: "New/ Common",
      field: "newColour",
      freeze: "center",
      width: 6,
    },
    {
      header: "Common Ref",
      field: "commonColourRef",
      freeze: "center",
      width: 6,
    },
  ],
};
