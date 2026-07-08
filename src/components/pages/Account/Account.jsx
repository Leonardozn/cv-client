import Sheet from "../../customs/Sheet/Sheet";
import Form from "../../customs/Form/Form";
import PopUp from "../../customs/PopUp/PopUp";
import { useChangePasswordController } from "../../../config/controllers/useChangePasswordController";
import "./Account.css";

const Account = () => {
	const { fields, value, isSubmitting, popUp, actions } = useChangePasswordController();

	return (
		<div className="account-page">
			<h1 className="account-title">Account</h1>

			<Sheet className="account-section" elevation={1}>
				<h2 className="account-section__title">Change Password</h2>
				<Form
					fields={fields}
					value={value}
					onChange={actions.onChange}
					onSubmit={actions.handleSubmit}
					submitText="Change Password"
					isLoading={isSubmitting}
					triggerPopUp={actions.openPopUp}
				/>
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
