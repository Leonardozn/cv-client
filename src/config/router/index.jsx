import { createBrowserRouter } from "react-router-dom";
import { ROOT_PATH, MAIN_PATH, REGISTER_PATH, LOGIN_PATH, FORGOT_PASSWORD_PATH } from "./paths";
import Landing from "../../components/pages/Landing/Landing";
import Register from "../../components/pages/Register/Register";
import Login from "../../components/pages/Login/Login";
import ForgotPassword from "../../components/pages/ForgotPassword/ForgotPassword";
import Main from "../../components/globals/Main/Main";
import NotFound from "../../components/pages/NotFound/NotFound";
import Home from "../../components/pages/Home/Home";
import Account from "../../components/pages/Account/Account";


import User from "../../components/pages/User/User";
import Curriculum from "../../components/pages/Curriculum/Curriculum";
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
		path: FORGOT_PASSWORD_PATH,
		element: <ForgotPassword />,
	},
	{
		path: MAIN_PATH,
		element: <Main />,
		children: [
			{
				path: `home`,
				element: <Home />,
			},
			{
				path: `template`,
				element: <Template />,
			},
			{
				path: `skill`,
				element: <Skill />,
			},
			{
				path: `curriculum`,
				element: <Curriculum />,
			},
			{
				path: `account`,
				element: <Account />,
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
