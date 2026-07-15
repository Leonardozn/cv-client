import { Link } from "react-router-dom";
import Form from "../../customs/Form/Form";
import Sheet from "../../customs/Sheet/Sheet";
import PopUp from "../../customs/PopUp/PopUp";
import { useRegisterController } from "../../../config/controllers/useRegisterController";
import { LOGIN_PATH } from "../../../config/router/paths";
import "./Register.css";

const Register = () => {
	const { fields, value, registered, isSubmitting, popUp, actions } = useRegisterController();

	return (
		<div className="register-page">
			<Sheet className="register-card" elevation={2}>
				<h1 className="register-title">Create your account</h1>

				{registered ? (
					<p className="register-success">
						Your account was created successfully. You can now <Link to={LOGIN_PATH}>sign in</Link>.
					</p>
				) : (
					<>
						<Form
							fields={fields}
							value={value}
							onChange={actions.onChange}
							onSubmit={actions.handleSubmit}
							submitText="Create account"
							isLoading={isSubmitting}
							triggerPopUp={actions.openPopUp}
						/>
						<p className="register-footer">
							Already have an account? <Link to={LOGIN_PATH}>Sign in</Link>
						</p>
					</>
				)}
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

export default Register;
