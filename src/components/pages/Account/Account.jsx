import Sheet from "../../customs/Sheet/Sheet";
import Form from "../../customs/Form/Form";
import PopUp from "../../customs/PopUp/PopUp";
import Modal from "../../customs/Modal/Modal";
import Button from "../../modulars/Button/Button";
import { useEditProfileController } from "../../../config/controllers/useEditProfileController";
import { useChangePasswordController } from "../../../config/controllers/useChangePasswordController";
import { useDeactivateAccountController } from "../../../config/controllers/useDeactivateAccountController";
import "./Account.css";

const Account = () => {
	const profile = useEditProfileController();
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
	const deactivate = useDeactivateAccountController();

	return (
		<div className="account-page">
			<h1 className="account-title">Account</h1>

			<Sheet className="account-section" elevation={1}>
				<h2 className="account-section__title">Edit Profile</h2>
				<Form
					fields={profile.fields}
					value={profile.value}
					onChange={profile.actions.onChange}
					onSubmit={profile.actions.handleSubmit}
					submitText="Save Changes"
					isLoading={profile.isSubmitting}
					triggerPopUp={profile.actions.openPopUp}
				/>
			</Sheet>

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

			<Sheet className="account-section account-section--danger" elevation={1}>
				<h2 className="account-section__title">Deactivate Account</h2>
				<p className="account-section__hint">
					Deactivating your account signs you out everywhere and prevents you from logging back
					in. This can be reversed only by an administrator.
				</p>
				<Button
					text="Deactivate Account"
					type="error"
					onClick={deactivate.actions.openConfirm}
				/>
			</Sheet>

			<Modal
				isOpen={deactivate.isConfirmOpen}
				onClose={deactivate.actions.closeConfirm}
				title="Deactivate Account"
				type="error"
			>
				<p className="account-section__hint">
					Are you sure you want to deactivate your account? You'll be signed out and won't be
					able to log back in until an administrator reactivates it.
				</p>
				<div className="account-danger-actions">
					<Button
						text="Cancel"
						type="neutral"
						outline={true}
						onClick={deactivate.actions.closeConfirm}
						disabled={deactivate.isSubmitting}
					/>
					<Button
						text="Deactivate Account"
						type="error"
						onClick={deactivate.actions.confirmDeactivate}
						disabled={deactivate.isSubmitting}
					/>
				</div>
			</Modal>

			<PopUp
				isOpen={profile.popUp.isOpen}
				onClose={profile.actions.closePopUp}
				type={profile.popUp.type}
				orientation="bottom-right"
				text={profile.popUp.text}
				duration={8000}
			/>

			<PopUp
				isOpen={popUp.isOpen}
				onClose={actions.closePopUp}
				type={popUp.type}
				orientation="bottom-right"
				text={popUp.text}
				duration={8000}
			/>

			<PopUp
				isOpen={deactivate.popUp.isOpen}
				onClose={deactivate.actions.closePopUp}
				type={deactivate.popUp.type}
				orientation="bottom-right"
				text={deactivate.popUp.text}
				duration={8000}
			/>
		</div>
	);
};

export default Account;
