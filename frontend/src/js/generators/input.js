module.exports 			= function(field) {
	const $input 		= $("<input/>");

	// Set input ID
	$input.attr("id", "field" + field.name);

	// Set input name
	$input.attr("name", field.name);

	// If input type is a boolean
	if (field.type.name !== "boolean") {
		// Set input classes
		$input.addClass("form-control");

		// Check if field type is a number (integer)
		const isNumber 	= field.type.name.indexOf("int") > -1 || field.type.name === "float";
		// Set input placeholder
		$input.attr("placeholder", field.title);

		// Set input type
		$input.attr("type", isNumber ? "number" : "text");		
	} else {
		// Set type to checkbox
		$input.attr("type", "checkbox");

		$input.addClass("ml-2");
	}

	// Set input required
	$input.prop("required", field.required);

	return $input;
};