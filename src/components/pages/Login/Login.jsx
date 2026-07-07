import { Link } from "react-router-dom";
import Form from "../../customs/Form/Form";
import Sheet from "../../customs/Sheet/Sheet";
import PopUp from "../../customs/PopUp/PopUp";
import { useLoginController } from "../../../config/controllers/useLoginController";
import "./Login.css";

const Login = () => {
	const { fields, isSubmitting, popUp, actions } = useLoginController();

	return (
		<div className="login-page">
			<Sheet className="login-card" elevation={2}>
				<h1 className="login-title">Sign in</h1>

				<Form
					fields={fields}
					onSubmit={actions.handleSubmit}
					submitText="Sign in"
					isLoading={isSubmitting}
					triggerPopUp={actions.openPopUp}
				/>

				<p className="login-footer">
					Don't have an account? <Link to="/admin/register">Create one</Link>
				</p>
			</Sheet>

			<PopUp
				isOpen={popUp.isOpen}
				onClose={actions.closePopUp}
				type={popUp.type}
				orientation="bottom-right"
				text={popUp.text}
				duration={10000}
			/>
		</div>
	);
};

export default Login;
