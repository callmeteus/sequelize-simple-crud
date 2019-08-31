module.exports 		= function(field) {
	const $input 	= $("<input/>");

	// Check if field type is a number (integer)
	const isNumber 	= field.type.name.indexOf("int") > -1;

	// Set input classes
	$input.addClass("form-control");

	// Set input ID
	$input.attr("id", "field" + field.name);

	// Set input name
	$input.attr("name", field.name);

	// Set input placeholder
	$input.attr("placeholder", field.title);

	// Set input type
	$input.attr("type", isNumber ? "number" : "text");

	// Set input required
	$input.prop("required", field.required);

	return $input;
};