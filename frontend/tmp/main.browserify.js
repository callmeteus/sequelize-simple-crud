(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports 		= {
	input: 			require("generators/input"),
	select: 		require("generators/select"),
	form: 			require("generators/form"),
	list: 			require("generators/list")
};
},{"generators/form":2,"generators/input":3,"generators/list":4,"generators/select":5}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
module.exports 					= function(route) {
	// Create a preloader
	const $preloader 			= $("<div><i class='fa fa-fw fa-spin fa-spinner mr-2'></i>Retrieving data...</div>");

	// Load the preloader
	$("#appContent").append($preloader);

	// Get list items
	$.get(window.location.pathname + "/" + route.route + "?page=" + (route.data.page ? route.data.page : 1), function(data) {
		// Remove the preloader
		$preloader.remove();

		// Show filter
		const $filter 			= $("<div class='row mb-3' />").appendTo("#appContent");

		$filter.append(`
			<div class="col-6">
				Showing ${data.items.length} items of ${data.count}
			</div>

			<div class="col-6">

			</div>
		`);

		// Create responsive table container
		const $container 		= $("<div class='table-responsive mb-3' />").appendTo("#appContent");

		// Create table
		const $table 			= $("<table class='table table-bordered table-hover' />").appendTo($container);

		// Create table head
		const $head 			= $("<thead class='thead-dark' />").appendTo($table);
		const $tr 				= $("<tr/>").appendTo($head);

		// For each route field
		route.fields.forEach((field) => {
			// Check if field is hidden
			if (field.hidden) {
				return false;
			}

			// Create field header
			const $th 			= $("<th/>").appendTo($tr);

			// Set field header name
			$th.text(field.primaryKey ? "#" : field.title);

			// Check if field is a primary key
			if (field.primaryKey) {
				// Set fixed width
				$th.attr("width", "50px");
			}
		});

		// Create table body
		const $body 			= $("<tbody/>").appendTo($table);

		// Iterate over all items
		data.items.forEach((item) => {
			// Create item row
			const $row 			= $("<tr class='crud-item' />");

			// Set row data
			$row.data("id", item.id);

			// For each route field
			route.fields.forEach((field) => {
				// Check if field is hidden
				if (field.hidden) {
					return false;
				}

				let $item;

				// Check if field is set into item
				if (item[field.name] === null || item[field.name] === undefined) {
					// Append an empty col
					$item 		= $("<td/>");
				} else {
					if (typeof item[field.name] === "object") {
						// Append col with object fields
						$item 	= $(
							"<td>" + 
								Object.keys(item[field.name]).map((key) => {
									return "<strong>" + key + "</strong> " + item[field.name][key];
								}).join("<br/>") || "" 
							+ "</td>"
						);
					} else {
						let value 	= item[field.name];

						if (value === null || value === undefined) {
							value 	= "<span class='text-muted'>null</span>";
						}

						// Append col with data
						$item 	= $("<td>" + value + "</td>");
					}
				}

				// Append item to row
				$item.appendTo($row);
			});

			// Append actions
			$row.find("td:first").append(`
				<div class="actions text-muted small">
					<a href="#" class="text-primary" data-route="${route.route}" data-method="edit">Edit</a> &middot; 
					<a href="#" class="text-danger" data-route="${route.route}" data-method="remove">Remove</a>
				</div>
			`);

			// Append to table body
			$row.appendTo($body);
		});

		// Create pages
		const $pages 		= $(`<ul class="pagination" />`).appendTo("#appContent");

		// Render pages
		for(let page = 1; page < (data.count / 10); page++) {
			$pages.append(`
				<li class='page-item'>
					<a class='page-link' href='#' data-route='${route.route}' data-method='list' data-page='${page}'>${page}
				</a>
			</li>`);
		}
	});
};
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
/**
 * Route handler
 * @type {Array}
 */
window.allRoutes 				= [];

const generators 				= require("generators");

function selectRoute(route, method = "insert", addons = {}) {
	// Get the route with additional data
	const data 					= Object.assign({
		data: 					addons
	}, allRoutes.find((r) => r.route === route));

	// Check if this route really exists
	if (data === undefined) {
		// Whoops...
		return false;
	}

	// Reset contente HTML and set the title
	$("#appContent").html(`
		<h3>${data.name}</h3>
		<hr/>
	`);

	// Switch the available methods
	switch(method) {
		// Case edit or insert
		case "insert":
		case "edit":
			generators.form(data, method, generators);
		break;

		// Case list
		case "list":
			generators.list(data);
		break;
	}

	$("#appContent").attr("data-action", "/admin/" + route);
	$("#appContent").attr("data-method", method);
}

// Get all CRUD routes
$.get(window.location.pathname + "/routes", function(routes) {
	// Save it
	allRoutes 					= routes;

	// Iterate over all routes
	routes.forEach((route) => {
		// Iterate over all route fields
		route.fields.forEach((field) => {
			// Set field title if not set
			field.title 		= field.title || field.name[0].toUpperCase() + field.name.slice(1);
		});

		// Add it to menu
		$("#appMenu").append(`
			<div class="list-group-item list-group-item-action dropdown-toggle" data-toggle="collapse" data-target=".route-${route.route}">
				${route.name}

				<div class="collapse route-${route.route} mt-2">
					<a href="#" class="list-group-item" data-route="${route.route}" data-method="insert">Insert new</a>
					<a href="#" class="list-group-item" data-route="${route.route}" data-method="list">List all</a>
				</div>
			</div>
		`);
	});
});

// On click a route
$("#appMenu, #appContent").on("click", "[data-route]", function(e) {
	e.stopPropagation();
	e.preventDefault();

	let $item;

	const $el 					= $(this);

	// Get item method
	const method 				= $el.data("method");

	// Get item route
	const route 				= $el.data("route");

	// Get item data
	const data 					= $el.parents(".crud-item").data();

	// Check if method is remove
	if (method === "remove") {
		// Confirm user action
		const $dialog 			= bootbox.confirm("You are about to remove the selected item. Are you sure?", (success) => {
			// Check if user has confirmed
			if (!success) {
				// Close the confirmation
				return true;
			}

			// Disable all buttons
			$dialog.find("button").prop("disabled", true);

			// Request the deletion
			$.ajax({
				url: 			window.location.pathname + "/" + route + "/" + data.id,
				method: 		"DELETE"
			})
			.always(() => {
				// Close the dialog
				$dialog.modal("hide");
			})
			.done((data) => {
				// Select the route list
				selectRoute(route, "list");
			})
			.fail((xhr, status, error) => {
				bootbox.alert(error);
			});

			// Don't close the modal
			return false;
		});

		return false;
	} else
	// Check if method is set
	if (method) {
		// Find related item in menu
		$item 					= $("#appMenu [data-route='" + route + "'][data-method='" + method + "']");
	} else {
		// Find related item in menu
		$item 					= $("#appMenu [data-route='" + route + "']");
	}

	// Remove currently active menu item
	$("#appMenu .active").removeClass("active");

	// Hide other collapses
	$("#appMenu .collapse.show").not($item.parents(".collapse")).collapse("hide");

	// Add active class to active item
	$item.addClass("active");

	// Select the desired route
	selectRoute(this.dataset.route, this.dataset.method, Object.assign($el.data(), data));
});

},{"generators":1}]},{},[6]);
