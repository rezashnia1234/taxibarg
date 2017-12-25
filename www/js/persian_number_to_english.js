String.prototype.toEnglishDigits = function() {
	//6٦۶
	var num_dic = {
		'۰': '0',
		'۱': '1',
		'۲': '2',
		'۳': '3',
		'۴': '4',
		'۵': '5',
		'۶': '6',
		'۷': '7',
		'۸': '8',
		'۹': '9',
		'٠': '0',
		'١': '1',
		'٢': '2',
		'٣': '3',
		'٤': '4',
		'٥': '5',
		'٦': '6',
		'٧': '7',
		'٨': '8',
		'٩': '9',
	}

	return this.replace(/[۰-۹]/g, function (w) {
		return num_dic[w]
	}).replace(/[٠-٩]/g, function (w) {
		return num_dic[w]
	});
};
function convert_persian_digit_to_english()
{
	jQuery('input[type="number"]').on('input', function() {
		var value = jQuery(this).val();
		jQuery(this).val(value.toEnglishDigits())
	});
	jQuery('input[type="mobile"]').on('input', function() {
		var value = jQuery(this).val();
		jQuery(this).val(value.toEnglishDigits())
	});
	jQuery('input[type="text"]').on('input', function() {
		var value = jQuery(this).val();
		jQuery(this).val(value.toEnglishDigits())
	});
};