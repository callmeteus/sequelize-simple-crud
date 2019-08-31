module.exports 				= function(route) {
	const $preloader 		= $("<div><i class='fa fa-fw fa-spin fa-spinner mr-2'></i>Retrieving data...</div>");

	// Load the preloader
	$("#appContent").append($preloader);

	// Get list items
	$.get(window.location.pathname + "/" + route.route, function(data) {
		// Remove the preloader
		$preloader.remove();

		const $container 	= $("<div class='table-responsive'/>").appendTo("#appContent");
		const $table 		= $("<table class='table table-bordered table-hover'/>").appendTo($container);
		const $head 		= $("<thead class='thead-dark' />").appendTo($table);
		const $tr 			= $("<tr/>").appendTo($head);

		// For each route field
		route.fields.forEach((field) => {
			// Check if field is hidden
			if (field.hidden) {
				return false;
			}

			// Create the header
			const $th 		= $("<th/>").appendTo($tr);

			// Set name
			$th.text(field.primaryKey ? "#" : field.title);

			if (field.primaryKey) {
				$th.attr("width", "50px");
			}
		});

		const $body 		= $("<tbody/>").appendTo($table);

		// Iterate over all items
		data.forEach((item) => {
			const $row 		= $("<tr class='crud-item' />");

			// Set row data
			$row.data("id", item.id);

			// For each route field
			route.fields.forEach((field) => {
				// Check if field is hidden
				if (field.hidden) {
					return false;
				}

				// Check if field is set into item
				if (item[field.name] === null || item[field.name] === undefined) {
					// Append an empty col
					$row.append("<td/>");
				} else {
					if (typeof item[field.name] === "object") {
						// Append col with object fields
						$row.append("<td>" + Object.keys(item[field.name]).map((key) => "<strong>" + key + "</strong> " + item[field.name][key]).join("<br/>") || "" + "</td>");
					} else {
						// Append col with data
						$row.append("<td>" + item[field.name] || "" + "</td>");
					}
				}
			});

			// Append actions
			$row.find("td:first").append(`
				<div class="actions text-muted small">
					<a href="#" class="text-primary" data-route="${route.route}" data-method="edit">Edit</a> &middot; 
					<a href="#" class="text-danger" data-route="${route.route}" data-method="remove">Remove</a>
				</div>
			`);

			$row.appendTo($body);
		});
	});
};