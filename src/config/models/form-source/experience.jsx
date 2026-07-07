import {
	BASE_PATH,
} from "../../environment";

export default [
	{
		id: "curriculum",
		label: "Curriculum",
		placeholder: "Curriculum",
		input: "select",
		value: '',
		dynamicOptions: {
			methodName: "GET_CURRICULUM_LIST",
			valueKey: "_id",
			labelKey: "name",
		},
		linkTo: `${BASE_PATH}/curriculum`,
		required: true,
	},
	{
		id: "position",
		label: "Position",
		placeholder: "Job title",
		input: "text",
		value: '',
		required: true,
	},
	{
		id: "company",
		label: "Company",
		placeholder: "Company name",
		input: "text",
		value: '',
		required: true,
	},
	{
		id: "location",
		label: "Location",
		placeholder: "City / country",
		input: "text",
		value: '',
	},
	{
		id: "startDate",
		label: "Start Date",
		placeholder: "Start date",
		input: "date",
		value: '',
		required: true,
	},
	{
		id: "endDate",
		label: "End Date",
		placeholder: "End date (empty if current)",
		input: "date",
		value: '',
	},
	{
		id: "description",
		label: "Description",
		placeholder: "Responsibilities / achievements",
		input: "text",
		value: '',
		required: true,
	},
];
