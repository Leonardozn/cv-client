import Form from "../../customs/Form/Form";
import Sheet from "../../customs/Sheet/Sheet";
import PopUp from "../../customs/PopUp/PopUp";
import { useRegisterController } from "../../../config/controllers/useRegisterController";
import "./Register.css";

const Register = () => {
	const { fields, registered, isSubmitting, popUp, actions } = useRegisterController();

	return (
		<div className="register-page">
			<Sheet className="register-card" elevation={2}>
				<h1 className="register-title">Create your account</h1>

				{registered ? (
					<p className="register-success">
						Your account was created successfully. You can now sign in.
					</p>
				) : (
					<Form
						fields={fields}
						onSubmit={actions.handleSubmit}
						submitText="Create account"
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

export default Register;
