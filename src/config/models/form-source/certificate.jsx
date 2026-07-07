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
		id: "name",
		label: "Name",
		placeholder: "Certificate / course name",
		input: "text",
		value: '',
		required: true,
	},
	{
		id: "date",
		label: "Date",
		placeholder: "Date obtained",
		input: "date",
		value: '',
		required: true,
	},
];
