export default [
	{
		key: "user",
		label: "User Id",
		searchable: true,
		type: "string",
	},
	{
		key: "fullName",
		label: "Full Name",
		searchable: true,
		type: "string",
	},
	{
		key: "headline",
		label: "Headline",
		searchable: true,
		type: "string",
	},
	{
		key: "city",
		label: "City",
		searchable: true,
		type: "string",
	},
	{
		key: "photo",
		label: "Photo",
	},
	{
		key: "profileSummary",
		label: "Profile Summary",
		searchable: true,
		type: "string",
	},
	{
		key: "skills",
		label: "Skills",
		renderCell: (val) => (Array.isArray(val) ? val.length : 0),
	},
	{
		key: "contactLinks",
		label: "Contact Links",
		renderCell: (val) => (Array.isArray(val) ? val.length : 0),
	},
	{
		key: "createdAt",
		label: "Created At",
	},
	{
		key: "updatedAt",
		label: "Updated At",
	},
];
