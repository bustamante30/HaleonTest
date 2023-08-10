export default {
  cols: [
    {
      header: "Sequence #",
      field: "sequenceNumber",
      freeze: "left",
      width: 5,
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
      width: 8,
    },
    {
      header: "Printer Plate Code",
      field: "imageCarrierId",
      freeze: "left",
      width: 8,
    },
    {
      header: "Quantity",
      field: "originalSets",
      type: "number",
      freeze: "center",
      width: 5,
    },
    {
      header: "Colour Type",
      field: "colourTypeDesc",
      freeze: "center",
      width: 6,
    },
    {
      header: "New/Common",
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
