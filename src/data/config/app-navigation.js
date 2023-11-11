const nav = (emit, isAdmin) => {
  const adminMenu = [];
  if (isAdmin === "PMSuperAdminUser") {
    adminMenu.push({ label: "Manage Users", to: "/users?role=super" });
  } else if (isAdmin === "PrinterAdmin") {
    adminMenu.push({ label: "Manage Users", to: "/users" });
  }

  return [
    ...adminMenu,
    {
      label: "Help",
      items: [
        {
          label: "Report an Issue",
          command: () => {
            emit("report");
          },
        },
        {
          label: "Watch Demo",
          command: () => {
            emit("demo");
          },
        },
        {
          label: "FAQs",
          to: "/faq",
        },
      ],
    },
  ];
};

export default nav;
