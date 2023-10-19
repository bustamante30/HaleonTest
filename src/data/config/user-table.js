const config = {
  cols: [
    {
      header: "First Name",
      field: "firstName",
      type: "link",
      path: "/users/$1",
      pathParams: ["id"],
      freeze: "left",
      width: 10,
    },
    {
      header: "Last Name",
      field: "lastName",
      type: "link",
      path: "/users/$1",
      pathParams: ["id"],
      width: 10,
    },
    {
      header: "Email",
      field: "email",
      type: "link",
      path: "/users/$1",
      pathParams: ["id"],
    },
    {
      header: "Admin",
      field: "isAdmin",
      type: "check",
      width: 3,
    },
  ],
  actions: () => {
    return [
      { icon: "redo", label: "Resend Invitation", event: "resend" },
      { icon: "edit", label: "Edit", event: "edit" },
      { icon: "delete", label: "Delete", event: "deleteUser" },
    ];
  },
};

export { config };
