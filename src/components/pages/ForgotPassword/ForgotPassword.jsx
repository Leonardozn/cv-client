import { Link } from "react-router-dom";
import Form from "../../customs/Form/Form";
import Sheet from "../../customs/Sheet/Sheet";
import PopUp from "../../customs/PopUp/PopUp";
import { useForgotPasswordController } from "../../../config/controllers/useForgotPasswordController";
import { LOGIN_PATH } from "../../../config/router/paths";
import "./ForgotPassword.css";

const ForgotPassword = () => {
	const { fields, value, submitted, isSubmitting, popUp, actions } = useForgotPasswordController();

	return (
		<div className="forgot-password-page">
			<Sheet className="forgot-password-card" elevation={2}>
				<h1 className="forgot-password-title">Reset your password</h1>

				{submitted ? (
					<p className="forgot-password-success">
						If that email is registered, we've sent a link to reset your password. Check
						your inbox. <Link to={LOGIN_PATH}>Back to sign in</Link>.
					</p>
				) : (
					<>
						<p className="forgot-password-hint">
							Enter your account's email and we'll send you a link to reset your password.
						</p>
						<Form
							fields={fields}
							value={value}
							onChange={actions.onChange}
							onSubmit={actions.handleSubmit}
							submitText="Send Reset Link"
							isLoading={isSubmitting}
							triggerPopUp={actions.openPopUp}
						/>
						<p className="forgot-password-footer">
							Remembered your password? <Link to={LOGIN_PATH}>Sign in</Link>
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

export default ForgotPassword;
