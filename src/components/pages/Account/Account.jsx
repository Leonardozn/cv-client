import Sheet from "../../customs/Sheet/Sheet";
import Form from "../../customs/Form/Form";
import PopUp from "../../customs/PopUp/PopUp";
import { useChangePasswordController } from "../../../config/controllers/useChangePasswordController";
import "./Account.css";

const Account = () => {
	const {
		step,
		requestFields,
		requestValue,
		verifyFields,
		verifyValue,
		isSubmitting,
		popUp,
		actions,
	} = useChangePasswordController();

	return (
		<div className="account-page">
			<h1 className="account-title">Account</h1>

			<Sheet className="account-section" elevation={1}>
				<h2 className="account-section__title">Change Password</h2>

				{step === "REQUEST" && (
					<Form
						fields={requestFields}
						value={requestValue}
						onChange={actions.onChangeRequest}
						onSubmit={actions.handleRequestChange}
						submitText="Send Verification Code"
						isLoading={isSubmitting}
						triggerPopUp={actions.openPopUp}
					/>
				)}

				{step === "VERIFY" && (
					<>
						<p className="account-section__hint">
							Enter the 6-digit code we emailed you to confirm the password change.
						</p>
						<Form
							key="verify"
							fields={verifyFields}
							value={verifyValue}
							onChange={actions.onChangeVerify}
							onSubmit={actions.handleVerifyCode}
							onCancel={actions.handleBackToRequest}
							cancelText="Start Over"
							submitText="Confirm Change"
							isLoading={isSubmitting}
							triggerPopUp={actions.openPopUp}
						/>
					</>
				)}
			</Sheet>

			<PopUp
				isOpen={popUp.isOpen}
				onClose={actions.closePopUp}
				type={popUp.type}
				orientation="bottom-right"
				text={popUp.text}
				duration={8000}
			/>
		</div>
	);
};

export default Account;
