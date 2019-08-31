function generateForm(route, method, generators, submitButton = true, renderAssociations = true) {
	const $form 				= $("<form/>").appendTo("#appContent");

	$form.addClass("crud-item");
	$form.data("route", route.route);
	$form.attr("method", "post");
	$form.data("id", route.id);

	// Iterate over all fields
	route.fields.forEach((field) => {
		// Check if field is read only or primary key
		if (field.readOnly || field.primaryKey) {
			return false;
		}

		const $group 			= $("<div/>");
		const $label 			= $("<label/>").appendTo($group);
		let $input;

		$group.addClass("form-group");

		$label.attr("for", "field" + field.name);
		$label.html(field.title);
		
		// Check if field is required
		if (field.required) {
			// Append a asterisk to the label
			$label.append("<span class='ml-1 text-warning'>*</span>");
		}

		// Check if field is an enum
		if (field.type.name !== "enum") {
			// Generate a normal field
			generators.input(field).appendTo($group);
		} else {
			// Generate a select field
			generators.select(field, field.type.values).appendTo($group);
		}		

		$group.appendTo($form);
	});

	// Check if need to render the associations
	if (renderAssociations && method === "insert") {
		// Iterate over all associations
		route.associations.forEach((association) => {
			const table 		= allRoutes.find((route) => route.route === association.table);

			const $container 	= $("<div/>").appendTo($form);

			$container.addClass("card mb-3");
			$container.append("<div class='card-header'>" + association.as + "</div>");

			const $association 	= generateForm(table, method, generators, false, false);

			// Remove all not required fields
			$association.find(":input").each(function() {
				if (!$(this).is(":required") || this.name === (association.foreignKey ? association.foreignKey : association.targetKey)) {
					return $(this).closest(".form-group").remove();
				}

				this.name 		= association.as + "[" + this.name + "]";
			});

			// Append the form to the container
			$association.addClass("card-body mb-n3").appendTo($container);
		});
	}

	if (submitButton === true) {
		// Append a submit button
		$form.append(`
			<div class="form-group">
				<button class="btn btn-primary btn-block" type="submit">${method === "insert" ? "Create" : "Save"}</button>
			</div>
		`);
	}

	return $form;
}

function updateForm($form, data) {
	// Populate form values
	Object.keys(data).forEach((key) => {
		$form.find("[name=" + key + "]").val(data[key]);
	});
}

module.exports 					= function(route, method = "insert", generators) {
	// Render the form
	const $form 				= generateForm(route, method, generators);

	// Check if it's editing
	if (method === "edit") {
		// Get current data
		$.get(window.location.pathname + "/" + route.route + "/" + route.data.id, function(data) {
			// Check if any error happened
			if (data.error) {
				return bootbox.alert(data.error);
			}				

			// Update the form
			updateForm($form, data);
		});
	}

	// On submit form
	$form.on("submit", function(e) {
		e.preventDefault();

		// Disable all inputs
		$(this).find(":input, button").prop("disabled", true);

		const data 				= {};

		$(this).find(":input").each(function() {
			if (this.value && this.value.length) {
				data[this.name] = this.value;
			}
		});

		// Do the insert or edit request
		$.ajax({
			url: 				window.location.pathname + "/" + route.route + (method === "edit" ? ("/" + route.data.id) : ""),
			method: 			method === "insert" ? "POST" : "PUT",
			data: 				data
		})
		.always(() => {
			// Enable all inputs
			$(this).find(":input, button").prop("disabled", false);
		})
		.done((data) => {
			// Update the form
			updateForm($form, data);

			// Check if method is insert
			if (method === "insert") {
				// Update the ID
				$form.data("id", data.id);

				// Update the method
				method 			= "edit";
			}
		})
		.fail((xhr, status, error) => {
			bootbox.alert(error);
		});
	});

	return $form;
};