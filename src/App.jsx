import { RouterProvider } from "react-router-dom";
import Router from "./config/router";

function App() {
	return (
		<>
			<RouterProvider router={Router} />
		</>
	);
}

export default App;
