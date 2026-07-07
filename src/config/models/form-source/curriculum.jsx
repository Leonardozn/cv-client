import { CV_API_HOST, CV_STATIC_IMAGES_HOST, CV_IMAGES_API_PATH } from "../../environment";

export const personalDataFields = [
	{ id: "fullName", label: "Full Name", placeholder: "Full name", input: "text", required: true },
	{
		id: "headline",
		label: "Headline",
		input: "sublist",
		outputType: "string",
		structure: [
			{ id: "name", label: "Headline", placeholder: "e.g. Software Engineer", input: "text", required: true },
		],
	},
	{ id: "city", label: "City", placeholder: "City", input: "text", required: true },
	{ id: "state", label: "State", placeholder: "State / province", input: "text", required: true },
	{ id: "country", label: "Country", placeholder: "Country", input: "text", required: true },
	{
		id: "phones",
		label: "Phones",
		input: "sublist",
		outputType: "string",
		structure: [
			{ id: "name", label: "Phone", placeholder: "e.g. +57 300 000 0000", input: "text", required: true },
		],
	},
	{
		id: "photo",
		label: "Photo",
		input: "file",
		accept: "image/*",
		apiHost: CV_API_HOST,
		imageHost: CV_STATIC_IMAGES_HOST,
		apiPath: CV_IMAGES_API_PATH,
	},
	{
		id: "contactLinks",
		label: "Contact Links",
		input: "sublist",
		structure: [
			{ id: "label", label: "Label", placeholder: "e.g. LinkedIn, GitHub", input: "text", required: true },
			{ id: "url", label: "URL", placeholder: "Link URL", input: "text", required: true },
		],
	},
];

export const profileFields = [
	{ id: "profileSummary", label: "Profile Summary", placeholder: "Tell us about your professional background", input: "text", required: true },
];

export const skillsFields = [
	{
		id: "skills",
		label: "Skills",
		input: "sublist",
		outputType: "string",
		structure: [
			{ id: "name", label: "Skill", placeholder: "e.g. Node.js", input: "text", required: true },
		],
	},
];
