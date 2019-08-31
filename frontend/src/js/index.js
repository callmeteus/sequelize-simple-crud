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
	selectRoute(this.dataset.route, this.dataset.method, data);
});