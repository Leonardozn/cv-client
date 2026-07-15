/**
 * Normalizes a static `options` array into the standard `{ id, value }` format.
 * - Simple values (string/number/boolean): each item becomes `{ id: item, value: String(item) }`.
 * - Object values: each item must contain both a `valueKey` and a `labelKey` property;
 *   objects missing either key (or with no keys at all, or whose keys don't include both)
 *   are filtered out. All items must be the same kind (all simple or all objects).
 */
const resolveStaticOptions = (options) => {
	if (!Array.isArray(options) || options.length === 0) return options;

	const firstItem = options[0];
	const isObjectArray = firstItem !== null && typeof firstItem === "object" && !Array.isArray(firstItem);

	if (isObjectArray) {
		return options
			.filter((item) => {
				if (!item || typeof item !== "object") return false;
				const keys = Object.keys(item);
				if (keys.length === 0) return false;
				const hasValueKey = "valueKey" in item;
				const hasLabelKey = "labelKey" in item;
				if (!hasValueKey && !hasLabelKey) return false;
				if (!hasValueKey || !hasLabelKey) return false;
				return true;
			})
			.map((item) => ({
				id: item.valueKey,
				value: item.labelKey,
			}));
	}

	// Simple values
	return options.map((item) => ({
		id: item,
		value: String(item),
	}));
};

export const mapDynamicOptions = async (config, apiMethods) => {
	return await Promise.all(
		config.map(async (field) => {
			// Top-level dynamic options (select fields)
			let resolvedField = field;
			if (field.dynamicOptions && field.dynamicOptions.methodName) {
				try {
					const { methodName, valueKey, labelKey, labelFormatter } = field.dynamicOptions;
					const apiMethod = apiMethods[methodName];
					const apiMethodFunc = apiMethod?.method || apiMethod;
					if (apiMethodFunc && typeof apiMethodFunc === "function") {
						const response = await apiMethodFunc();
						const dataPath = apiMethod.response?.data || "";
						const dataArray = dataPath
							? dataPath
									.split(".")
									.reduce((acc, part) => acc && acc[part], response)
							: Array.isArray(response)
								? response
								: response.data || [];
						const options = dataArray.map((item) => ({
							id: item[valueKey],
							value: typeof labelFormatter === "function" ? labelFormatter(item) : item[labelKey],
						}));
						resolvedField = { ...field, options };
					}
				} catch (error) {
					console.error(`Error loading options for ${field.id}:`, error);
				}
			} else if (!field.dynamicOptions && Array.isArray(field.options)) {
				// Static options array: normalize to standard { id, value } format
				resolvedField = { ...field, options: resolveStaticOptions(field.options) };
			}

			// Sublist & Objects: recursively resolve all structure columns (supports nested structures)
			if (
				(resolvedField.input === "sublist" || resolvedField.input === "object") &&
				Array.isArray(resolvedField.structure)
			) {
				const resolvedStructure = await resolveStructureColumns(
					resolvedField.structure,
					apiMethods,
				);
				return { ...resolvedField, structure: resolvedStructure };
			}

			return resolvedField;
		}),
	);
};

/**
 * Recursively resolves a structure column array:
 * - Resolves `dynamicOptions` into `.options` for select columns.
 * - Recurses into nested sublists (`input: "sublist"` with their own `structure`).
 */
const resolveStructureColumns = async (structure, apiMethods) => {
	return await Promise.all(
		structure.map(async (col) => {
			let resolvedCol = col;

			// Resolve dynamicOptions if present on this column
			if (resolvedCol.dynamicOptions?.methodName) {
				try {
					const { methodName, valueKey, labelKey, labelFormatter } = resolvedCol.dynamicOptions;
					const apiMethod = apiMethods[methodName];
					const apiMethodFunc = apiMethod?.method || apiMethod;
					if (apiMethodFunc && typeof apiMethodFunc === "function") {
						const response = await apiMethodFunc();
						const dataPath = apiMethod.response?.data || "";
						const dataArray = dataPath
							? dataPath
									.split(".")
									.reduce((acc, part) => acc && acc[part], response)
							: Array.isArray(response)
								? response
								: response.data || [];
						const options = dataArray.map((item) => ({
							id: item[valueKey],
							value: typeof labelFormatter === "function" ? labelFormatter(item) : item[labelKey],
						}));
						resolvedCol = { ...resolvedCol, options };
					}
				} catch (error) {
					console.error(`Error loading sublist options for ${col.id}:`, error);
				}
			} else if (!resolvedCol.dynamicOptions && Array.isArray(resolvedCol.options)) {
				// Static options array: normalize to standard { id, value } format
				resolvedCol = { ...resolvedCol, options: resolveStaticOptions(resolvedCol.options) };
			}

			// Recursively resolve nested structure (for sublists and objects)
			if (
				(resolvedCol.input === "sublist" || resolvedCol.input === "object") &&
				Array.isArray(resolvedCol.structure)
			) {
				const resolvedNestedStructure = await resolveStructureColumns(
					resolvedCol.structure,
					apiMethods,
				);
				resolvedCol = { ...resolvedCol, structure: resolvedNestedStructure };
			}

			return resolvedCol;
		}),
	);
};

export const fetchAndResolveTableData = async (
	apiMethod,
	params = {},
) => {
	const apiMethodFunc = apiMethod?.method || apiMethod;
	const res = await apiMethodFunc(params);

	const dataPath = apiMethod.response?.data || "";
	const countPath = apiMethod.response?.count || "";

	const rawRecords = dataPath
		? dataPath.split(".").reduce((acc, part) => acc && acc[part], res)
		: Array.isArray(res)
			? res
			: res.data || [];

	const rawCount = countPath
		? countPath.split(".").reduce((acc, part) => acc && acc[part], res)
		: rawRecords.length;

	return {
		records: rawRecords,
		count: rawCount,
	};
};

export const buildTableSearchQuery = (search, tableConfig) => {
	if (!search || !tableConfig) return {};

	const searchFields = tableConfig.filter((col) => col.searchable);
	const query = {};

	searchFields.forEach((field) => {
		if (field.type === "string") {
			query[field.key] = { or: { like: search } };
		} else if (
			field.type === "number" &&
			!isNaN(search) &&
			search.trim() !== ""
		) {
			query[field.key] = { or: { eq: Number(search) } };
		}
	});

	return query;
};

const VISUAL_FORMATTER_INPUTS = ["number", "string", "textarea", "date", "datetime", "time"];

export const mapTableRenderCells = async (columnsConfig, apiMethods) => {
	return await Promise.all(
		columnsConfig.map(async (col) => {
			// Visual labelFormatter for scalar field types (purely display, does not affect payload)
			if (
				typeof col.labelFormatter === "function" &&
				VISUAL_FORMATTER_INPUTS.includes(col.input) &&
				!col.renderCell
			) {
				return {
					...col,
					renderCell: (val) => val !== undefined && val !== null ? col.labelFormatter(val) : val,
				};
			}
      
			if (col.type === "id" && col.labelKey && !col.renderCell) {
				const methodName = col.methodName || `GET_${col.key.toUpperCase()}_LIST`;

				if (apiMethods[methodName]) {
					try {
						const apiMethod = apiMethods[methodName];
						const apiMethodFunc = apiMethod?.method || apiMethod;
						const response = await apiMethodFunc();
						const dataPath = apiMethod.response?.data || "";

						const dataArray = dataPath
							? dataPath.split(".").reduce((acc, part) => acc && acc[part], response)
							: Array.isArray(response)
								? response
								: response.data || [];

						const options = dataArray.map((item) => ({
							id: String(item._id || item.id),
							value: item[col.labelKey],
						}));

						return {
							...col,
							renderCell: (val) => {
								if (val && !Array.isArray(val)) {
									const match = options.find((o) => o.id === val);
									return match?.value || val;
								}

								return "";
							},
						};
					} catch (error) {
						console.error(`Error loading table options for ${col.key}:`, error);
					}
				} else {
					return {
						...col,
						renderCell: (val) => {
							if (!val) return val;
							if (Array.isArray(val)) return val.length;
							return typeof val === "object" ? val._id || val.id || String(val) : val;
						}
					};
				}
			}
			return col;
		})
	);
};

export const preparePayload = (formData, config) => {
	const checkHasFile = (data, fields) => {
		if (!fields || !data) return false;
		return fields.some((field) => {
			const key = field.id || field.name;
			const val = data[key];
			if (val === undefined || val === null) return false;

			if (field.input === "file" && val instanceof File) return true;

			if (field.input === "files" && Array.isArray(val) && val.some((item) => item instanceof File)) return true;

			if (field.input === "object" && field.structure && typeof val === "object") {
				return checkHasFile(val, field.structure);
			}

			if (field.input === "sublist" && field.structure && Array.isArray(val)) {
				return val.some((item) => checkHasFile(item, field.structure));
			}

			return false;
		});
	};

	const hasFile = checkHasFile(formData, config);

	// Create a normalized copy for dates
	const normalizeDates = (data, fields) => {
		if (!data || typeof data !== "object" || data instanceof File) return data;
		const normalized = Array.isArray(data) ? [...data] : { ...data };
		
		if (Array.isArray(normalized)) {
			return normalized.map(item => normalizeDates(item, fields));
		}

		fields?.forEach((field) => {
			const k = field.id || field.name;
			const v = normalized[k];
			if (v === undefined || v === null) return;

			if (field.input === "date") {
				normalized[k] = String(v).slice(0, 10);
			} else if (field.input === "object" && field.structure && typeof v === "object") {
				normalized[k] = normalizeDates(v, field.structure);
			} else if (field.input === "sublist" && field.structure && Array.isArray(v)) {
				normalized[k] = v.map(item => normalizeDates(item, field.structure));
			}
		});
		return normalized;
	};

	const applyValidations = (data, fields) => {
		if (!data || typeof data !== "object" || data instanceof File) return data;
		const result = Array.isArray(data) ? [...data] : { ...data };

		if (Array.isArray(result)) {
			return result.map((item) => applyValidations(item, fields));
		}

		fields?.forEach((field) => {
			const k = field.id || field.name;
			if (result[k] === undefined || result[k] === null) return;

			if (typeof field.validations === "function") {
				result[k] = field.validations(result[k]);
			}

			if (field.input === "object" && field.structure && typeof result[k] === "object") {
				result[k] = applyValidations(result[k], field.structure);
			} else if (field.input === "sublist" && field.structure && Array.isArray(result[k])) {
				result[k] = result[k].map((item) => applyValidations(item, field.structure));
			}
		});

		return result;
	};

	const normalizedData = applyValidations(normalizeDates(formData, config), config);

	if (hasFile) {
		const payload = new FormData();
		const appendRecursive = (data, parentKey = "") => {
			if (data instanceof File) {
				payload.append(parentKey, data);
			} else if (Array.isArray(data)) {
				data.forEach((item, index) => {
					if (item instanceof File) {
						payload.append(parentKey, item);
					} else {
						appendRecursive(item, `${parentKey}[${index}]`);
					}
				});
			} else if (typeof data === "object" && data !== null) {
				Object.entries(data).forEach(([key, value]) => {
					if (key === "_id" || key === "id") return;
					const fullKey = parentKey ? `${parentKey}[${key}]` : key;
					appendRecursive(value, fullKey);
				});
			} else if (data !== undefined && data !== null && data !== "") {
				payload.append(parentKey, data);
			}
		};
		appendRecursive(normalizedData);
		return payload;
	}

	return Object.fromEntries(
		Object.entries(normalizedData).filter(([k, v]) => 
			v !== null && v !== undefined && v !== "" && k !== "_id" && k !== "id"
		)
	);
};
