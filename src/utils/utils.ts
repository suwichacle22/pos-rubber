import { TransactionLineDBType } from "./transactions.server";
import { format } from "date-fns";
import moment from "moment";
import { th, enUS } from "date-fns/locale";

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
	farmerAmount: string,
	employeeAmount: string,
	totalWeight: string,
	transportationFee: string,
) {
	const totalWeightNum = parseFloat(totalWeight);
	const farmerAmountNum = parseFloat(farmerAmount);
	const employeeAmountNum = parseFloat(employeeAmount);
	const transportationFeeNum = parseFloat(transportationFee);

	const transportationFeeAmount = transportationFeeNum
		? Math.round(totalWeightNum * transportationFeeNum).toString()
		: "";
	const farmerTransportationFeeAmount = transportationFeeAmount
		? (parseFloat(transportationFeeAmount) + farmerAmountNum).toString()
		: "";
	const employeeTransportationFeeAmount = transportationFeeAmount
		? (employeeAmountNum - parseFloat(transportationFeeAmount)).toString()
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

export function formatNumber(value: string) {
	const num = parseFloat(value);
	if (Number.isNaN(num)) return String(value ?? "");
	if (Number.isInteger(num)) return num.toString(); // 35 → "35"
	return num.toFixed(2); // 35.3 → "35.30", 35.30 → "35.30"
}

export function formatRatio(value: string) {
	const num = parseFloat(value);
	const ratio = num * 100;
	return ratio.toFixed(0).toString();
}

export function summaryTransactionText(data: TransactionLineDBType) {
	const {
		weight,
		price,
		totalAmount,
		farmerAmount,
		farmerRatio,
		transportationFeeFarmerAmount,
		employeeAmount,
		employeeRatio,
		transportationFeeEmployeeAmount,
		transportationFeeAmount,
	} = data;
	const formatWeight = formatNumber(weight);
	const formatPrice = formatNumber(price);
	const formatTotalAmount = formatNumber(totalAmount);
	const formatFarmerRatio = formatRatio(farmerRatio);
	const formatFarmerAmount = formatNumber(farmerAmount);
	const formatEmployeeRatio = formatRatio(employeeRatio);
	const formatEmployeeAmount = formatNumber(employeeAmount);
	const formatTransportationFeeAmount = formatNumber(transportationFeeAmount);
	const formatTransportationFeeFarmerAmount = formatNumber(
		transportationFeeFarmerAmount,
	);
	const formatTransportationFeeEmployeeAmount = formatNumber(
		transportationFeeEmployeeAmount,
	);

	const summaryCalculateText = `${formatWeight} x ${formatPrice} = ${formatTotalAmount}`;
	const farmerAmountText = `${formatFarmerRatio}:  ${formatFarmerAmount}`;
	const employeeAmountText = `${formatEmployeeRatio}:  ${formatEmployeeAmount}`;
	const farmerCalculateTransportationFeeText = `${formatFarmerRatio}: ${formatFarmerAmount} + ${formatTransportationFeeAmount} `;
	const farmerAmountTransportationFeeText = `= ${formatTransportationFeeFarmerAmount}`;
	const farmerAllTransportationFeeText = `${farmerCalculateTransportationFeeText} ${farmerAmountTransportationFeeText}`;
	const employeeCalculateTransportationFeeText = `${formatEmployeeRatio}: ${formatEmployeeAmount} - ${formatTransportationFeeAmount} `;
	const employeeAmountTransportationFeeText = `= ${formatTransportationFeeEmployeeAmount}`;
	const employeeAllTransportationFeeText = `${employeeCalculateTransportationFeeText} ${employeeAmountTransportationFeeText}`;
	return {
		summaryCalculateText,
		farmerAmountText,
		employeeAmountText,
		farmerCalculateTransportationFeeText,
		farmerAmountTransportationFeeText,
		farmerAllTransportationFeeText,
		employeeCalculateTransportationFeeText,
		employeeAmountTransportationFeeText,
		employeeAllTransportationFeeText,
	};
}

const monthThai = {
	"01": "มกราคม",
	"02": "กุมภาพันธ์",
	"03": "มีนาคม",
	"04": "เมษายน",
	"05": "พฤษภาคม",
	"06": "มิถุนายน",
	"07": "กรกฎาคม",
	"08": "สิงหาคม",
	"09": "กันยายน",
	"10": "ตุลาคม",
	"11": "พฤศจิกายน",
	"12": "ธันวาคม",
};

export const formatDateThai = (inputDate: Date) => {
	const day = format(inputDate, "dd");
	const month =
		monthThai[(format(inputDate, "MM") ?? "01") as keyof typeof monthThai];
	const year = String(parseInt(format(inputDate, "yyyy"), 10) + 543);

	const dateThai = `${day} ${month} ${year}`;
	const time = format(inputDate, "HH:mm");
	return { dateThai, time };
};
