import Sheet from "../../customs/Sheet/Sheet";
import Form from "../../customs/Form/Form";
import PopUp from "../../customs/PopUp/PopUp";
import EntryListSection from "../../customs/EntryListSection/EntryListSection";
import Spinner from "../../modulars/Spinner/Spinner";
import { useCurriculumFormController } from "../../../config/controllers/useCurriculumFormController";
import { personalDataFields, profileFields, skillsFields } from "../../../config/models/form-source/curriculum";
import educationFields from "../../../config/models/form-source/education";
import experienceFields from "../../../config/models/form-source/experience";
import certificateFields from "../../../config/models/form-source/certificate";
import "./Curriculum.css";

const SectionStatus = ({ status, pendingSync }) => {
	if (pendingSync) return <span className="curriculum-section__status curriculum-section__status--pending">Pending sync</span>;
	if (status === "SAVED") return <span className="curriculum-section__status curriculum-section__status--saved">Saved</span>;
	if (status === "ERROR") return <span className="curriculum-section__status curriculum-section__status--error">Couldn't save</span>;
	return null;
};

const Curriculum = () => {
	const {
		status,
		curriculumId,
		personalData,
		profile,
		skills,
		education,
		experience,
		certificate,
		popUp,
		actions,
	} = useCurriculumFormController();

	if (status === "INITIALIZING") {
		return (
			<div className="curriculum-page curriculum-page--loading">
				<Spinner style={{ "--spinner-size": "2rem" }} />
			</div>
		);
	}

	return (
		<div className="curriculum-page">
			<h1 className="curriculum-title">Curriculum</h1>

			<Sheet className="curriculum-section" elevation={1}>
				<div className="curriculum-section__header">
					<h2 className="curriculum-section__title">Personal Data</h2>
					<SectionStatus status={personalData.status} pendingSync={personalData.pendingSync} />
				</div>
				<Form
					fields={personalDataFields}
					value={personalData.value}
					onChange={actions.handleChangePersonalData}
					onSubmit={actions.handleSavePersonalData}
					submitText="Save"
					isLoading={personalData.status === "SAVING"}
					triggerPopUp={actions.openPopUp}
				/>
			</Sheet>

			<Sheet className="curriculum-section" elevation={1}>
				<div className="curriculum-section__header">
					<h2 className="curriculum-section__title">Profile</h2>
					<SectionStatus status={profile.status} pendingSync={profile.pendingSync} />
				</div>
				<Form
					fields={profileFields}
					value={profile.value}
					onChange={actions.handleChangeProfile}
					onSubmit={actions.handleSaveProfile}
					submitText="Save"
					isLoading={profile.status === "SAVING"}
					triggerPopUp={actions.openPopUp}
				/>
			</Sheet>

			<Sheet className="curriculum-section" elevation={1}>
				<div className="curriculum-section__header">
					<h2 className="curriculum-section__title">Skills</h2>
					<SectionStatus status={skills.status} pendingSync={skills.pendingSync} />
				</div>
				<Form
					fields={skillsFields}
					value={skills.value}
					onChange={actions.handleChangeSkills}
					onSubmit={actions.handleSaveSkills}
					submitText="Save"
					isLoading={skills.status === "SAVING"}
					triggerPopUp={actions.openPopUp}
				/>
			</Sheet>

			<EntryListSection
				title="Education"
				fields={educationFields}
				entries={education.entries}
				emptyText="No education entries yet."
				renderPrimary={(entry) => `${entry.title} — ${entry.institution}`}
				renderSecondary={(entry) => `${entry.startDate?.slice(0, 10) || ""} – ${entry.endDate?.slice(0, 10) || "Present"}`}
				isSaving={education.status === "SAVING"}
				pendingSync={education.pendingSync}
				pendingEntry={education.pendingEntry}
				disabled={!curriculumId}
				disabledHint="Save your Personal Data first to add education entries."
				onSave={actions.handleSaveEducation}
				onRemove={actions.handleRemoveEducation}
				triggerPopUp={actions.openPopUp}
			/>

			<EntryListSection
				title="Experience"
				fields={experienceFields}
				entries={experience.entries}
				emptyText="No experience entries yet."
				renderPrimary={(entry) => `${entry.position} — ${entry.company}`}
				renderSecondary={(entry) => `${entry.startDate?.slice(0, 10) || ""} – ${entry.endDate?.slice(0, 10) || "Present"}`}
				isSaving={experience.status === "SAVING"}
				pendingSync={experience.pendingSync}
				pendingEntry={experience.pendingEntry}
				disabled={!curriculumId}
				disabledHint="Save your Personal Data first to add experience entries."
				onSave={actions.handleSaveExperience}
				onRemove={actions.handleRemoveExperience}
				triggerPopUp={actions.openPopUp}
			/>

			<EntryListSection
				title="Certificates"
				fields={certificateFields}
				entries={certificate.entries}
				emptyText="No certificates yet."
				renderPrimary={(entry) => entry.name}
				renderSecondary={(entry) => entry.date?.slice(0, 10)}
				isSaving={certificate.status === "SAVING"}
				pendingSync={certificate.pendingSync}
				pendingEntry={certificate.pendingEntry}
				disabled={!curriculumId}
				disabledHint="Save your Personal Data first to add certificates."
				onSave={actions.handleSaveCertificate}
				onRemove={actions.handleRemoveCertificate}
				triggerPopUp={actions.openPopUp}
			/>

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

export default Curriculum;
