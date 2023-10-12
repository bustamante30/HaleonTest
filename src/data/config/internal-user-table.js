const config = {
  cols: [
    {
      header: "First Name",
      field: "firstName",
      type: "link",
      path: "/users/$1",
      pathParams: ["id"],
      freeze: "left",
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
    // {
    //   header: 'Location',
    //   field: 'location',
    //   type: 'dropdown',
    //   options: { key: 'locations' },
    // },
    // {
    //   header: 'Admin',
    //   field: 'isAdmin',
    //   type: 'check',
    //   width: 3
    // },
  ],
};

export { config };
