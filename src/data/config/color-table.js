export default {
  sortBy: ["sequenceNumber"],
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
      width: 10,
    },
    {
      header: "SGS Colour",
      field: "colourName",
      freeze: "left",
      width: 11,
    },
    {
      header: "Printer Plate Code",
      field: "imageCarrierId",
      freeze: "left",
      width: 8,
    },
    {
      header: "Colour Type",
      field: "colourType",
      freeze: "center",
      width: 6,
    },
    {
      header: "New/Common",
      field: "newColour",
      freeze: "center",
      width: 8,
    },
    {
      header: "Common Ref",
      field: "commonColourRef",
      freeze: "center",
      width: 8,
    },
  ],
};
