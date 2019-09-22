class SimpleCrudTableFilter {
	constructor(data) {
		this.type 		= data.type || null;
		this.field 		= data.field || null;
	}
}

module.exports 			= SimpleCrudTableFilter;