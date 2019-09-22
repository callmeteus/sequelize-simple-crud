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