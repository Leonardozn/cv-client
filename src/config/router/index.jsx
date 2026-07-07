import { createBrowserRouter } from "react-router-dom";
import { ROOT_PATH, MAIN_PATH, REGISTER_PATH, LOGIN_PATH } from "./paths";
import Landing from "../../components/pages/Landing/Landing";
import Register from "../../components/pages/Register/Register";
import Login from "../../components/pages/Login/Login";
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
		path: ROOT_PATH,
		element: <Landing />,
	},
	{
		path: REGISTER_PATH,
		element: <Register />,
	},
	{
		path: LOGIN_PATH,
		element: <Login />,
	},
	{
		path: MAIN_PATH,
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
