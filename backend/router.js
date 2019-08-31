/**
 * Automatic CRUD generator for Sequelize
 * Generates a web page to administrate a database using express and sequelize
 * By Matheus Giovani (https://github.com/theprometeus)
 */

// Require all modules
const express 					= require("express");
const Sequelize 				= require("sequelize");
const Controller				= require("./controller");
const path 						= require("path");

const SimpleCrudRouter 			= Symbol("SimpleCrudRouter");

class SimpleCrud {
	constructor(options = {}) {
		// Define the routes handler
		this.routes 			= [];

		// Create the router
		this[SimpleCrudRouter]	= new express.Router();

		// Expose all routes
		if (options.exposeRoutes !== false) {
			// Serve routes on /routes endpoint
			this[SimpleCrudRouter].get("/routes", (req, res) => {
				res.json(this.routes);
			});
		}

		// Expose panel
		if (options.exposePanel !== false && options.exposeRoutes !== false) {
			this[SimpleCrudRouter].use(express.static(path.join(__dirname, "/../frontend/www")));
		}
	}

	/**
	 * Create a CRUD endpoint for a desired table and route
	 * @param  {SimpleCrudTable} table     Simple CRUD Table
	 * @return {Object}
	 */
	createRoute(table) {
		// Create the CRUD controller
		const controller 		= new Controller(table);

		// Add controller routes to router
		this[SimpleCrudRouter].get("/" + table.route + "/:id", controller.getItem.bind(controller));
		this[SimpleCrudRouter].get("/" + table.route, controller.getItems.bind(controller));
		this[SimpleCrudRouter].post("/" + table.route, controller.createItem.bind(controller));
		this[SimpleCrudRouter].put("/" + table.route + "/:id", controller.updateItem.bind(controller));
		this[SimpleCrudRouter].delete("/" + table.route + "/:id", controller.deleteItem.bind(controller));

		// Add it to routes
		this.routes.push(table);

		return controller;
	}

	get router() {
		return this[SimpleCrudRouter];
	}

	getRoute(routeName) {
		return this.routes.find((route) => route.route === routeName);
	}
};

module.exports 					= SimpleCrud;