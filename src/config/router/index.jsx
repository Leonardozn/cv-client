import { createBrowserRouter } from "react-router-dom";
import Landing from "../../components/pages/Landing/Landing";
import Main from "../../components/globals/Main/Main";
import NotFound from "../../components/pages/NotFound/NotFound";


const router = createBrowserRouter([
	{
		path: "/admin",
		element: <Landing />,
	},
	{
		path: "admin",
		element: <Main />,
		children: [
			// Add child routes here
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
