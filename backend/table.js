const SimpleCrudTableSequelize 				= Symbol("SimpleCrudTableSequelize");
const SimpleCrudTableFields 				= Symbol("SimpleCrudTableFields");

class SimpleCrudTable {
	constructor(table) {
		// Check if it's a valid table
		if (table.sequelize === undefined || table.rawAttributes === undefined) {
			throw new Error("Given object is not a valid Sequelize model.");
		}

		// Set table name
		this.name 							= table.tableName;
		this.name 							= this.name.charAt(0).toUpperCase() + this.name.substr(1, this.name.length - 2);

		// Set table route
		this.route 							= table.tableName;

		// Set table handler
		this[SimpleCrudTableSequelize] 		= table;

		// Set fields array
		this.fields 						= [];

		// Iterate over all table attributes
		Object.values(table.rawAttributes).forEach((attribute) => {
			const type 						= {};

			type.name 						= attribute.type.constructor.name.toLowerCase();

			Object.keys(attribute.type).forEach((key) => type[key] = attribute.type[key]);

			delete type._length;

			// Create field initial data
			const field 					= {
				name: 						attribute.field,
				type: 						type,
				defaultValue: 				attribute.defaultValue || null,
				hidden: 					false,
				required: 					attribute.allowNull === false,
				readOnly: 					attribute.field === "updatedAt" || attribute.field === "createdAt",
				primaryKey: 				attribute.primaryKey === true,
				autoIncrement: 				attribute.autoIncrement === true
			};

			// Add the table attribute
			this.fields.push(field);
		});

		// Set table associations
		this.associations 					= [];

		// Check if model has associations if any
		if (table.associations) {
			// Iterate over all model associations
			Object.keys(table.associations).forEach((key) => {
				// Get the association
				const association 			= table.associations[key];

				// Get associations options
				const options 				= association.options;

				// Save the association
				this.associations.push({
					table: 					association.target.tableName,
					as: 					options.as,
					sourceKey: 				options.sourceKey,
					targetKey: 				options.targetKey,
					foreignKey: 			options.foreignKey
				});
			});
		}
	}

	get mandatoryFields() {
		return this.fields.filter((field) => field.required === true);
	}

	get optionalFields() {
		return this.fields.filter((field) => field.required === false);
	}

	get readOnlyFields() {
		return this.fields.filter((field) => field.readOnly === true);
	}

	get hiddenFields() {
		return this.fields.filter((field) => field.hidden === true);
	}

	setFieldProperty(fieldName, propertyName, propertyValue) {
		const field 						= this.fields.find((field) => field.name === fieldName);
		field[propertyName] 				= propertyValue;

		return field;
	}

	setHidden(fieldName, value = true) {
		return this.setFieldProperty(fieldName, "hidden", value);
	}

	setReadOnly(fieldName, value = true) {
		return this.setFieldProperty(fieldName, "readOnly", value);
	}

	removeAssociation(associationName) {
		return this.associations.splice(this.associations.findIndex((association) => association.as === associationName), 1);
	}

	getTable() {
		return this[SimpleCrudTableSequelize];
	}
}

module.exports 								= SimpleCrudTable;