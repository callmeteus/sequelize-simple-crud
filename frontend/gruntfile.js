module.exports 							= function(grunt) {
	grunt.initConfig({
		// Browserify
		browserify: 					{
			vendor: 					{
				files: 					{
					"tmp/vendor.browserify.js": ["src/js/vendor.js"]
				},
				options: 				{
					shim: 				{
						bootstrap: 		{
							depends: 	{
								jquery: "$"
							}
						}
					}
				}
			},
			main: 						{
				files: 					{
					"tmp/main.browserify.js": 	["tmp/main.browserify.js"]
				},
				options: 				{
					browserifyOptions: 	{
						paths: 			["./src/js/", "./tmp/"]
					}
				}
			}
		},
		// Clean tmp directory
		clean: 							{
			tmp: 						["tmp/"]
		},
		// Watch for file changes
		watch: 							{
			css: 						{
				files: 					"src/**/*.css",
				tasks: 					["build-css"],
			},
			js: 						{
				files: 					["src/**/*.js"],
				tasks: 					["build-js"],
			},
			options: 					{
				livereload: 			9090
			}
		},
		// Uglify code
		uglify: 						{
			build: 						{
				src: 					"www/js/index.js",
				dest: 					"www/js/index.js"
			}
		},
		// Concat files
		concat: 						{
			// All files
			all: 						{
				src: 					["tmp/vendor.browserify.js", "tmp/main.browserify.js"],
				dest: 					"www/js/index.js",
				options: 				{
					separator: 			";\n"
				}
			},
			// App modules
			modules: 					{
				src: 					["src/js/views/**/*.js"],
				dest: 					"tmp/main.browserify.js"
			},
			// Main file
			index: 						{
				src: 					["src/js/index.js", "tmp/main.browserify.js"],
				dest: 					"tmp/main.browserify.js"
			},
			// CSS files
			css: 						{
				src: 					[
					"node_modules/@fortawesome/fontawesome-free/css/all.min.css",
					"src/css/bootstrap.css",
					"src/css/**/*.css"
				],
				dest: 					"www/css/index.css",
			}
		},
		// Copy files
		copy: 							{
			ejs: 						{
				files: 					[{
					cwd: 				"src/views",
					src: 				"**",
					dest: 				"tmp/views/",
					expand: 			true
				}, {
					cwd: 				"src/js/",
					src: 				"fpte.js",
					dest: 				"tmp/",
					expand: 			true
				}]
			},
			fontawesome: 				{
				files: 					[{
					cwd: 				"node_modules/@fortawesome/fontawesome-free/webfonts",
					src: 				"**",
					dest: 				"www/webfonts/",
					expand: 			true
				}]
			},
			assets: 					{
				files: 					[{
					cwd: 				"assets",
					src: 				"*",
					dest: 				"www",
					expand: 			true
				}]
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");

	grunt.registerTask("build", ["build-css", "build-js"]);
	grunt.registerTask("default", ["build", "watch"]);
	grunt.registerTask("dist", ["build", "uglify"]);

	grunt.registerTask("build-css", ["concat:css", "copy:fontawesome"]);

	grunt.registerTask("build-js", function() {
		if (grunt.cli.tasks.indexOf("dist") > -1) {
			grunt.config.data.browserify.main.options.transform.push(["babelify", { presets: ["@babel/preset-env"] }]);
		}

		grunt.task.run(["clean:tmp", "concat:modules", "concat:index", "copy:ejs", "browserify", "concat:all", "copy:assets"]);
	});
};