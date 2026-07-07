import { Link } from "react-router-dom";
import Card from "../../customs/Card/Card";
import PopUp from "../../customs/PopUp/PopUp";
import Button from "../../modulars/Button/Button";
import Spinner from "../../modulars/Spinner/Spinner";
import { useHomeController } from "../../../config/controllers/useHomeController";
import "./Home.css";

const Home = () => {
	const { status, curriculumId, templates, generatingId, popUp, actions } = useHomeController();

	if (status === "INITIALIZING") {
		return (
			<div className="home-page home-page--loading">
				<Spinner style={{ "--spinner-size": "2rem" }} />
			</div>
		);
	}

	return (
		<div className="home-page">
			<h1 className="home-title">Home</h1>

			{!curriculumId && (
				<p className="home-empty-state">
					You don't have a CV yet, so there's nothing to render into a PDF. Fill in
					your Personal Data and Profile to create one — then come back here to pick a
					design and download it. <Link to="curriculum">Go to Curriculum</Link>
				</p>
			)}

			{curriculumId && templates.length === 0 && (
				<p className="home-empty-state">
					No designs are available right now. This is a catalog managed by an admin —
					check back later, your CV data is already saved.
				</p>
			)}

			{curriculumId && templates.length > 0 && (
				<div className="home-template-grid">
					{templates.map((template) => {
						const templateId = template._id || template.id;
						const isGenerating = generatingId === templateId;
						return (
							<Card
								key={templateId}
								title={template.name}
								description={template.description}
								footer={
									<Button
										text={isGenerating ? "Generating…" : "Download PDF"}
										type="primary"
										disabled={generatingId !== null}
										icon={isGenerating ? <Spinner type="#ffffff" /> : undefined}
										onClick={() => actions.handleGeneratePdf(templateId)}
									/>
								}
							/>
						);
					})}
				</div>
			)}

			<PopUp
				isOpen={popUp.isOpen}
				onClose={actions.closePopUp}
				type={popUp.type}
				orientation="bottom-right"
				text={popUp.text}
				duration={6000}
			/>
		</div>
	);
};

export default Home;
