# sequelize-simple-crud
A simple and automatic CRUD API with panel for Sequelize.

# Usage example
```
const Crud = require("sequelize-simple-crud");
const express = require("express");
const Sequelize = require("sequelize");

// Create a simple sequelize table
const table = sequelize.define("user", {
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    isEmail: true
  }
});

// Create the CRUD router
const router = new Crud.Router({
  exposeRoutes: true
});

// Create the express instance
const app = express();

// Create a CRUD table based in the Sequelize table
const crudTable = new Crud.Table(table);

// Add table to router
router.createRoute(crudTable);

// Use the router
app.use(router.router);

// Start the app
app.listen(80);
```
