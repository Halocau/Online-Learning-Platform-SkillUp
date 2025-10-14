export const newsColumns = [
  { key: "title", title: "Title" },
  { key: "category", title: "Category" },
  { key: "date", title: "Date" },
  {
    key: "status",
    title: "Status",
    render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        val === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}>
        {val}
      </span>
    ),
  },
];

export const newsFilters = [
  {
    key: "category",
    placeholder: "Filter by Category",
    options: [
      { value: "education", label: "Education" },
      { value: "update", label: "Update" },
    ],
  },
  {
    key: "status",
    placeholder: "Filter by Status",
    options: [
      { value: "Published", label: "Published" },
      { value: "Draft", label: "Draft" },
    ],
  },
];

export const newsFields = [
  { name: "title", label: "Title" },
  { name: "category", label: "Category" },
  { name: "status", label: "Status" },
];
