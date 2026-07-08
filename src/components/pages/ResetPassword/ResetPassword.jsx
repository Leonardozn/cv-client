import { Link } from "react-router-dom";
import Form from "../../customs/Form/Form";
import Sheet from "../../customs/Sheet/Sheet";
import PopUp from "../../customs/PopUp/PopUp";
import { useResetPasswordController } from "../../../config/controllers/useResetPasswordController";
import { LOGIN_PATH, FORGOT_PASSWORD_PATH } from "../../../config/router/paths";
import "./ResetPassword.css";

const ResetPassword = () => {
	const { hasToken, fields, value, submitted, isSubmitting, popUp, actions } = useResetPasswordController();

	return (
		<div className="reset-password-page">
			<Sheet className="reset-password-card" elevation={2}>
				<h1 className="reset-password-title">Reset your password</h1>

				{!hasToken && (
					<p className="reset-password-error">
						This link is missing its reset token, so we can't verify it. Request a new
						reset link from <Link to={FORGOT_PASSWORD_PATH}>here</Link>.
					</p>
				)}

				{hasToken && submitted && (
					<p className="reset-password-success">
						Your password has been reset. <Link to={LOGIN_PATH}>Sign in</Link> with your
						new password.
					</p>
				)}

				{hasToken && !submitted && (
					<Form
						fields={fields}
						value={value}
						onChange={actions.onChange}
						onSubmit={actions.handleSubmit}
						submitText="Reset Password"
						isLoading={isSubmitting}
						triggerPopUp={actions.openPopUp}
					/>
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

export default ResetPassword;
