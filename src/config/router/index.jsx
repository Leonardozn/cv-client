import { createBrowserRouter } from "react-router-dom";
import Landing from "../../components/pages/Landing/Landing";
import Main from "../../components/globals/Main/Main";
import NotFound from "../../components/pages/NotFound/NotFound";


import User from "../../components/pages/User/User";
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
