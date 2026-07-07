import React from "react";
import Form from "../../customs/Form/Form";
import { useTemplateController } from "../../../config/controllers/useTemplateController";

import PopUp from "../../customs/PopUp/PopUp";
import Modal from "../../customs/Modal/Modal";
import Sheet from "../../customs/Sheet/Sheet";
import Button from "../../modulars/Button/Button";
import Spinner from "../../modulars/Spinner/Spinner";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import DataTable from "../../customs/DataTable/DataTable";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import "./Template.css";

const Template = () => {
	const {
		data,
		columns,
		fields,
		value,
		pagination,
		search,
		modal,
		confirm,
		popUp,
		isLoading,
		isSubmitting,
		isViewMode,
		actions
	} = useTemplateController();

	return (
		<div className="template-page">
			<h1 className="template-title">Template Management</h1>

			<Sheet className="template-actions">
				<div className="template-actions-left">
					{isLoading && <Spinner style={{ "--spinner-size": "2rem" }} />}
				</div>
				<div className="template-actions-btn">
					<Button 
						text="New Template" 
						type="primary" 
						onClick={actions.handleNew} 
						disabled={isSubmitting}
					/>
				</div>
			</Sheet>

			<Sheet className="template-content">
				{data.length === 0 && !search.value && !isLoading ? (
					<p className="template-empty-state">
						No records found. Use the "New Template" button to add one.
					</p>
				) : (
					<DataTable
						columns={[
							...columns,
							{
								key: "actions",
								label: "Actions",
								width: "120px",
								renderCell: (_, item) => (
									<div style={{ display: "flex", gap: "0.25rem" }}>
										<ActionButton
											icon={<FiEye />}
											type="neutral"
											onClick={() => actions.handleEdit(item, true)}
											style={{
												width: "2rem",
												height: "2rem",
												fontSize: "1rem",
											}}
										/>
										<ActionButton
											icon={<FiEdit2 />}
											type="secondary"
											onClick={() => actions.handleEdit(item, false)}
											style={{
												width: "2rem",
												height: "2rem",
												fontSize: "1rem",
											}}
										/>
										<ActionButton
											icon={<FiTrash2 />}
											type="error"
											onClick={() => actions.handleDelete(item)}
											style={{
												width: "2rem",
												height: "2rem",
												fontSize: "1rem",
											}}
										/>
									</div>
								),
							},
						]}
						data={data}
						alternate={true}
						search={true}
						searchValue={search.value}
						onSearchChange={actions.setSearch}
						pagination={{
							currentPage: pagination.currentPage,
							totalPages: pagination.totalPages,
							onClick: actions.setPage,
							rowsOptions: [5, 10, 20, 50],
							rowsPerPage: pagination.rowsPerPage,
							onRowsChange: actions.setRowsPerPage,
							type: "primary",
						}}
						onObjectClick={(data, col) => {
							const fieldConfig = fields.find(f => f.id === col.key);
							actions.handleViewDetail(data, fieldConfig?.structure);
						}}
					/>
				)}
			</Sheet>

			<Modal
				isOpen={modal.isOpen}
				onClose={actions.closeModal}
				title={`${modal.mode === 'VIEW' ? 'View' : modal.mode === 'EDIT' ? 'Edit' : 'New'} Template`}
				size="md"
			>
				<Form
					key={modal.isOpen ? "open" : "closed"}
					fields={fields}
					value={value}
					onChange={actions.onChange}
					onSubmit={isViewMode ? undefined : actions.handleSubmit}
					onCancel={actions.closeModal}
					submitText={modal.mode === 'EDIT' ? 'Save changes' : 'Add Template'}
					isLoading={isSubmitting}
					triggerPopUp={actions.openPopUp}
				/>
			</Modal>

			<Modal
				isOpen={confirm.isOpen}
				onClose={actions.closeConfirm}
				title={confirm.title}
			>
				<p
					style={{
						marginTop: 0,
						marginBottom: "1.5rem",
						color: "var(--color-foreground-muted)",
						lineHeight: 1.5,
					}}
				>
					{confirm.text}
				</p>
				<div
					style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
				>
					<Button
						text="Cancel"
						type="neutral"
						outline={true}
						onClick={actions.closeConfirm}
					/>
					<Button
						text="Confirm"
						type="primary"
						onClick={confirm.onConfirm}
						isLoading={isSubmitting}
					/>
				</div>
			</Modal>

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

export default Template;
