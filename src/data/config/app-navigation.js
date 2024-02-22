const nav = (emit) => {
  return [
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
          command: () => {
            emit("faq");
          },
        },
      ],
    },
  ];
};

export default nav;
