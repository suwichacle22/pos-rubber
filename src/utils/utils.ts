export function calculateTotalAmount(weight: string, price: string) {
	const weightNum = parseFloat(weight);
	const priceNum = parseFloat(price);

	// Return empty string if either value is null, undefined, empty, 0, or NaN
	if (
		!weight ||
		!price ||
		weightNum === 0 ||
		priceNum === 0 ||
		Number.isNaN(weightNum) ||
		Number.isNaN(priceNum)
	) {
		return "";
	}

	return Math.round(weightNum * priceNum).toString();
}

export function calculateSplitAmount(totalAmount: string, ratio: string) {
	const totalNum = parseFloat(totalAmount);
	const ratioNum = parseFloat(ratio);

	// Return empty string if either value is null, undefined, empty, 0, or NaN
	if (
		!totalAmount ||
		!ratio ||
		totalNum === 0 ||
		ratioNum === 0 ||
		Number.isNaN(totalNum) ||
		Number.isNaN(ratioNum)
	) {
		return "";
	}

	return Math.round(totalNum * ratioNum).toString();
}

export function calculateTransportationFeeAmount(
	totalAmount: string,
	totalWeight: string,
	transportationFee: string,
) {
	const totalWeightNum = parseFloat(totalWeight);
	const totalAmountNum = parseFloat(totalAmount);
	const transportationFeeNum = parseFloat(transportationFee);

	const transportationFeeAmount = transportationFeeNum
		? Math.round(totalWeightNum * transportationFeeNum).toString()
		: "";
	const farmerTransportationFeeAmount = transportationFeeAmount
		? (parseFloat(transportationFeeAmount) + totalAmountNum).toString()
		: "";
	const employeeTransportationFeeAmount = transportationFeeAmount
		? (totalAmountNum - parseFloat(transportationFeeAmount)).toString()
		: "";
	return {
		transportationFeeAmount,
		farmerTransportationFeeAmount,
		employeeTransportationFeeAmount,
	};
}

export function calculateSplitPercentage(farmerRatio: string) {
	const farmerRatioNum = parseFloat(farmerRatio);
	if (Number.isNaN(farmerRatioNum)) {
		return "";
	}
	return (1 - farmerRatioNum).toFixed(2).toString();
}

export function calculateHarvestRateAmount(
	harvestRate: string,
	weight: string,
	totalAmount: string,
) {
	const harvestRateNum = parseFloat(harvestRate);
	const weightNum = parseFloat(weight);
	const totalAmountNum = parseFloat(totalAmount);
	if (
		Number.isNaN(harvestRateNum) ||
		Number.isNaN(weightNum) ||
		Number.isNaN(totalAmountNum)
	) {
		return {
			harvestRateAmount: "",
			farmerAmount: "",
			employeeAmount: "",
		};
	}

	const harvestRateAmount = Math.round(harvestRateNum * weightNum);

	return {
		harvestRateAmount: harvestRateAmount.toString(),
		farmerAmount: (totalAmountNum - harvestRateAmount).toString(),
		employeeAmount: harvestRateAmount.toString(),
	};
}

export function calculatePromotionAmount(
	promotionRate: string,
	weight: string,
) {
	const promotionRateNum = parseFloat(promotionRate);
	const weightNum = parseFloat(weight);
	if (Number.isNaN(promotionRateNum) || Number.isNaN(weightNum)) {
		return "";
	}
	return Math.round(promotionRateNum * weightNum).toString();
}

export function calculateVehicleWeight(
	weightVehicleIn: string,
	weightVehicleOut: string,
) {
	const weightVehicleInNum = parseFloat(weightVehicleIn);
	const weightVehicleOutNum = parseFloat(weightVehicleOut);
	if (Number.isNaN(weightVehicleInNum) || Number.isNaN(weightVehicleOutNum)) {
		return "";
	}
	return (weightVehicleInNum - weightVehicleOutNum).toString();
}

export function calculateTransactionTotalNetAmount(
	totalAmount: string,
	promotionAmount: string,
) {
	const totalAmountNum = parseFloat(totalAmount) || 0;
	const promotionAmountNum = parseFloat(promotionAmount) || 0;
	return (totalAmountNum + promotionAmountNum).toString();
}
