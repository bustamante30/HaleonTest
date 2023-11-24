const config = {
  cols: [
    {
      header: "First Name",
      field: "firstName",
      type: "link",
      path: "/users/$1",
      pathParams: ["id"],
      width: 12,
    },
    {
      header: "Last Name",
      field: "lastName",
      type: "text",
      width: 12,
    },
    {
      header: "Email",
      field: "email",
      type: "text",
    },
    // {
    //   header: 'Designation',
    //   field: 'designation',
    //   type: 'text',
    //   width: 12
    // },
    {
      header: "Plating Location",
      field: "platingLocationName",
      type: "text",
      // options: { key: 'locations' },
    },
    // {
    //   header: 'Admin',
    //   field: 'isAdmin',
    //   type: 'check',
    //   width: 3
    // },
  ],
};

export { config };
