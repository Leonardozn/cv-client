import { createBrowserRouter } from "react-router-dom";
import Landing from "../../components/pages/Landing/Landing";
import Main from "../../components/globals/Main/Main";
import NotFound from "../../components/pages/NotFound/NotFound";


import User from "../../components/pages/User/User";
import Curriculum from "../../components/pages/Curriculum/Curriculum";
import Education from "../../components/pages/Education/Education";
import Experience from "../../components/pages/Experience/Experience";
import Certificate from "../../components/pages/Certificate/Certificate";
import Skill from "../../components/pages/Skill/Skill";
import Template from "../../components/pages/Template/Template";
const router = createBrowserRouter([
	{
		path: "/admin",
		element: <Landing />,
	},
	{
		path: "admin",
		element: <Main />,
		children: [
			{
				path: `template`,
				element: <Template />,
			},
			{
				path: `skill`,
				element: <Skill />,
			},
			{
				path: `certificate`,
				element: <Certificate />,
			},
			{
				path: `experience`,
				element: <Experience />,
			},
			{
				path: `education`,
				element: <Education />,
			},
			{
				path: `curriculum`,
				element: <Curriculum />,
			},
			{
				path: `user`,
				element: <User />,
			},
			// Add child routes here
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
