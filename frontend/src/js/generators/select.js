module.exports 		= function(field, options) {
	const $input 	= $("<select/>");

	// Set input classes
	$input.addClass("form-control custom-select");

	// Set input ID
	$input.attr("id", "field" + field.name);

	// Set input name
	$input.attr("name", field.name);

	// Set input required
	$input.prop("required", field.required);

	// Append default value
	$input.append("<option selected disabled>" + field.title + "</option>");

	// Iterate over all options
	options.forEach((option) => {
		const $option 	= $("<option/>").appendTo($input);
		$option.prop("selected", field.defaultValue === option);
		$option.attr("value", option);
		$option.append(option);
	});

	return $input;
};