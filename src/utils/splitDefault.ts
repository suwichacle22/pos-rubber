// biome-ignore lint/suspicious/noExplicitAny: form API type is complex
type FormApi = { setFieldValue: (name: any, value: any) => void };

interface SplitDefaultRecord {
	isSplit?: string;
	isHarvestRate?: boolean;
	harvestRate?: number;
	farmerSplitRatio?: number;
	employeeSplitRatio?: number;
	isTransportationFee?: boolean;
	transportationFee?: number;
	promotionTo?: string;
	promotionRate?: number;
	farmerPaidType?: string;
	employeePaidType?: string;
}

export function applySplitDefaultToLine(
	splitDefault: SplitDefaultRecord,
	form: FormApi,
	index: number,
) {
	if (splitDefault.isHarvestRate) {
		// Palm harvest mode
		form.setFieldValue(`transactionLines[${index}].isSplit`, "none");
		form.setFieldValue(`transactionLines[${index}].isHarvestRate`, true);
		if (splitDefault.harvestRate != null) {
			form.setFieldValue(
				`transactionLines[${index}].harvestRate`,
				String(splitDefault.harvestRate),
			);
		}
	} else if (splitDefault.isSplit && splitDefault.isSplit !== "none") {
		// Rubber split mode — setting isSplit triggers existing onChange listener
		// in TransactionLinesSplit.tsx which handles ratios + amounts for presets
		form.setFieldValue(
			`transactionLines[${index}].isSplit`,
			splitDefault.isSplit,
		);
		// For "custom" preset, also set ratios explicitly (onChange won't know them)
		if (splitDefault.isSplit === "custom") {
			if (splitDefault.farmerSplitRatio != null) {
				form.setFieldValue(
					`transactionLines[${index}].farmerRatio`,
					String(splitDefault.farmerSplitRatio),
				);
			}
			if (splitDefault.employeeSplitRatio != null) {
				form.setFieldValue(
					`transactionLines[${index}].employeeRatio`,
					String(splitDefault.employeeSplitRatio),
				);
			}
		}
	}

	// Optional fields — apply if present
	if (splitDefault.isTransportationFee != null) {
		form.setFieldValue(
			`transactionLines[${index}].isTransportationFee`,
			splitDefault.isTransportationFee,
		);
		if (splitDefault.transportationFee != null) {
			form.setFieldValue(
				`transactionLines[${index}].transportationFee`,
				String(splitDefault.transportationFee),
			);
		}
	}
	if (splitDefault.promotionTo) {
		form.setFieldValue(
			`transactionLines[${index}].promotionTo`,
			splitDefault.promotionTo,
		);
	}
	if (splitDefault.promotionRate != null) {
		form.setFieldValue(
			`transactionLines[${index}].promotionRate`,
			String(splitDefault.promotionRate),
		);
	}
	if (splitDefault.farmerPaidType) {
		form.setFieldValue(
			`transactionLines[${index}].farmerPaidType`,
			splitDefault.farmerPaidType,
		);
	}
	if (splitDefault.employeePaidType) {
		form.setFieldValue(
			`transactionLines[${index}].employeePaidType`,
			splitDefault.employeePaidType,
		);
	}
}
