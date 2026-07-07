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
		id: "title",
		label: "Title",
		placeholder: "Degree / program title",
		input: "text",
		value: '',
		required: true,
	},
	{
		id: "institution",
		label: "Institution",
		placeholder: "Institution",
		input: "text",
		value: '',
		required: true,
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
		placeholder: "End date (empty if ongoing)",
		input: "date",
		value: '',
	},
];
