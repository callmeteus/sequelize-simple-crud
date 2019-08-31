// Require jQuery
window.$ 			= require("jquery").noConflict();
window.jQuery 		= window.$;

// Require popper.js
require("popper.js");

// Require Bootstrap
require("bootstrap/dist/js/bootstrap");

// Require bootbox
window.bootbox 		= require("bootbox/dist/bootbox.min");

// Require bootbox language
require("bootbox/bootbox.locales.js");

// Require ES6 shim (for old browsers)
require("es6-shim");