const Table 							= Symbol("SimpleCrudTable");
const Filter 							= Symbol("SimpleCrudFilter");

class SimpleCrudItem {
	constructor(data, filter) {
		// Iterate over all object keys
		Object.keys(data).forEach((key) => {
			// Check if the key is in the filter
			if (filter.indexOf(key) > -1) {
				// Ignore it
				return true;
			}

			// Add value to the object
			this[key] 					= data[key];
		});
	}
}

class SimpleCrudController {
	constructor(table) {
		// Save a reference to the sequelize table
		this[Table] 					= table;

		// Optional filter for all items
		this[Filter] 					= {};

		// Options
		this.options 					= {
			limit: 						10
		};
	}

	/**
	 * Get a single item
	 * @param  {Object}   req  Express request
	 * @param  {Object}   res  Express response
	 * @param  {Function} next Express next
	 */
	getItem(req, res, next) {
		// Find one item using request parameters
		this[Table].getTable().findOne({
			where: 						{
				id: 					req.params.id
			}
		})
		.then((item) => {
			// Check if item exists
			if (!item) {
				// Send 404 status
				res.status(404).json({});
			} else {
				// Send filtered item data
				res.json(new SimpleCrudItem(item.get(), this[Table].hiddenFields));
			}
		})
	}

	/**
	 * Get all available items
	 * @param  {Object}   req  Express request
	 * @param  {Object}   res  Express response
	 * @param  {Function} next Express next
	 */
	getItems(req, res, next) {
		let count 						= 0;

		this[Table].getTable().count({
			where: 						this[Filter]
		})
		.then((counter) => {
			// Save counter
			count 						= counter;

			// Find all items
			return this[Table].getTable().findAll({
				where: 					this[Filter],
				limit: 					this.options.limit,
				skip: 					(this.options.limit * parseInt(req.params.page || 1, 10) - 1)
			});
		})
		.then((items) => {
			// Return all items
			res.json({
				count: 					count,
				items: 					items.map((item) => new SimpleCrudItem(item.get(), this[Table].hiddenFields))
			});
		})
		.catch(next);
	}

	/**
	 * Create an item
	 * @param  {Object}   req  Express request
	 * @param  {Object}   res  Express response
	 * @param  {Function} next Express next
	 */
	createItem(req, res, next) {
		const data 						= new SimpleCrudItem(req.body, this[Table].hiddenFields);

		// Create a new item
		this[Table].getTable().create(data, {
			include: 					this[Table].associations.map((association) => association.as)
		})
		.then((item) => {
			// Find and return updated item
			return res.json(item.get());
		})
		.catch(next);
	}

	/**
	 * Update an item
	 * @param  {Object}   req  Express request
	 * @param  {Object}   res  Express response
	 * @param  {Function} next Express next
	 */
	updateItem(req, res, next) {
		const data 						= new SimpleCrudItem(req.body, this[Table]);

		// Update an item
		this[Table].getTable().update(data, {
			where: 						{
				id: 					req.params.id
			}
		})
		.then((item) => {
			// Find and return updated item
			return this.getItem(req, res, next);
		})
		.catch(next);
	}

	/**
	 * Delete an item
	 * @param  {Object}   req  Express request
	 * @param  {Object}   res  Express response
	 * @param  {Function} next Express next
	 */
	deleteItem(req, res, next) {
		// Destroy an item
		this[Table].getTable().destroy({
			where: 						{
				id: 					req.params.id
			}
		})
		.then((item) => {
			// Find and return updated item
			return res.json({
				success: 				true
			});
		})
		.catch(next);
	}
}

module.exports 							= SimpleCrudController;