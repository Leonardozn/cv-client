export const formatCurrency = (value, locale = "en-US", currency = "USD") => {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 0,
	}).format(Number(value) || 0);
};
