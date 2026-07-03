import React from "react";
import Form from "../../customs/Form/Form";
import brandConfig from "../../../config/models/form-source/brand";
import brandTableConfig from "../../../config/models/table-source/brand";
import apiMethods from "../../../config/controllers/jotam-autopartes-api";
import { useModelController } from "../../../config/controllers/model-controller";

import PopUp from "../../customs/PopUp/PopUp";
import Modal from "../../customs/Modal/Modal";
import Sheet from "../../customs/Sheet/Sheet";
import Button from "../../modulars/Button/Button";
import Spinner from "../../modulars/Spinner/Spinner";
import ActionButton from "../../modulars/ActionButton/ActionButton";
import DataTable from "../../customs/DataTable/DataTable";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

const ModelControllerExampleUsage = () => {
	// 1. Initialize the controller with specific configurations
	const {
		data,
		fields,
		pagination,
		search,
		modal,
		confirm,
		popUp,
		isLoading,
		isSubmitting,
		isViewMode,
		actions
	} = useModelController({
		formConfig: brandConfig,
		tableConfig: brandTableConfig,
		apiMethods,
		apiActions: {
			list: apiMethods.GET_BRAND_LIST,
			add: apiMethods.ADD_BRAND,
			replace: apiMethods.REPLACE_BRAND,
			remove: apiMethods.REMOVE_BRAND,
			find: apiMethods.FIND_ONE_BRAND
		},
		modelName: "Brand",
		broadcastChannel: "enode-updates" // Optional: used for auto-refresh
	});

	return (
		<div className="brand-page">
			<Sheet className="brand-actions">
				<div className="brand-actions-left">
					{isLoading && <Spinner style={{ "--spinner-size": "2rem" }} />}
				</div>
				<div className="brand-actions-btn">
					<Button 
						text="New Brand" 
						type="primary" 
						onClick={actions.handleNew} 
						disabled={isSubmitting}
					/>
				</div>
			</Sheet>

			<Sheet className="brand-content">
				{/* 2. Display DataTable using controller state and actions */}
				<DataTable
					columns={[
						...brandTableConfig,
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
					search={true}
					searchValue={search.value}
					onSearchChange={actions.setSearch}
					pagination={{
						currentPage: pagination.currentPage,
						totalPages: pagination.totalPages,
						onClick: actions.setPage,
						rowsPerPage: pagination.rowsPerPage,
						onRowsChange: actions.setRowsPerPage,
					}}
				/>
			</Sheet>

			{/* 3. Handle Create/Edit/View Modals */}
			<Modal
				isOpen={modal.isOpen}
				onClose={actions.closeModal}
				title={`${modal.mode === 'VIEW' ? 'View' : modal.mode === 'EDIT' ? 'Edit' : 'New'} Brand`}
			>
				<Form
					key={modal.isOpen ? "open" : "closed"}
					fields={fields}
					onSubmit={isViewMode ? undefined : actions.handleSubmit}
					onCancel={actions.closeModal}
					isLoading={isSubmitting}
				/>
			</Modal>

			{/* 4. Global Modals and PopUps managed by the controller */}
			<Modal
				isOpen={confirm.isOpen}
				onClose={actions.closeConfirm}
				title={confirm.title}
			>
				<p>{confirm.text}</p>
				<div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
					<Button text="Cancel" type="neutral" onClick={actions.closeConfirm} />
					<Button text="Confirm" type="primary" onClick={confirm.onConfirm} isLoading={isSubmitting} />
				</div>
			</Modal>

			<PopUp
				isOpen={popUp.isOpen}
				onClose={actions.closePopUp}
				type={popUp.type}
				text={popUp.text}
			/>
		</div>
	);
};

export default ModelControllerExampleUsage;
