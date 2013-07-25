module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-recess');
	grunt.loadNpmTasks('grunt-html2js');

	// Print a timestamp (useful for when watching)
	grunt.registerTask('timestamp', function() {
		grunt.log.subhead(Date());
	});

	grunt.initConfig({
		distdir: 'dist',

		pkg: grunt.file.readJSON('package.json'),

		src: {
			js: ['src/app/**/*.js', '<%= distdir %>/templates/**/*.js'],
			specs: ['test/**/*.spec.js'],
			scenarios: ['test/**/*.scenario.js'],
			html: ['src/index.html'],
			tpl: {
				app: ['src/app/templates/*.html', 'src/app/templates/**/*.html'],
				common: ['src/common/**/*.tpl.html']
			},
			less: ['src/less/stylesheet.less'], // recess:build doesn't accept ** in its file patterns
			lessWatch: ['src/less/**/*.less']
		},

		clean: ['<%= distdir %>/*'],

		copy: {
      assets: {
        files: [{ dest: '<%= distdir %>', src : '**', expand: true, cwd: 'src/assets/' }]
      }
    },

    concat: {
      index: {
        src: ['src/index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      }
    },

		requirejs: {
			mobileJS: {
				options: {
					baseUrl: "./src/app",
					wrap: true,
					// Don't use almond if your project needs to load modules dynamically
					name: "../libs/almond",
					preserveLicenseComments: false,
					optimize: "uglify",
					optimizeCss: "standard",
					mainConfigFile: "src/app/config/config.js",
					include: ["init/MobileInit"],
					out: "<%= distdir %>/MobileInit.min.js",

					/*********
					* https://github.com/SlexAxton/require-handlebars-plugin
					*/
					pragmasOnSave: {
						//removes Handlebars.Parser code (used to compile template strings) set
						//it to `false` if you need to parse template strings even after build
						excludeHbsParser : true,
						// kills the entire plugin set once it's built.
						excludeHbs: true,
						// removes i18n precompiler, handlebars and json2
						excludeAfterBuild: true
					},

					locale: "en_us",

					// options object which is passed to Handlebars compiler
					hbs : {
						templateExtension: "html",
						helperDirectory: "templates/helpers/",
						i18nDirectory: "templates/i18n/",

						compileOptions: {}
					}
				}
			},
			mobileCSS: {
				options: {
					optimizeCss: "standard",
					cssIn: "src/css/mobile.css",
					out: "<%= distdir %>/css/mobile.min.css"
				}
			},
			desktopJS: {
				options: {
					baseUrl: "./src/app",
					wrap: true,
					// Cannot use almond since it does not currently appear to support requireJS's config-map
					name: "../libs/almond",
					preserveLicenseComments: false,
					optimize: "uglify",
					mainConfigFile: "src/app/config/config.js",
					include: ["init/DesktopInit"],
					out: "<%= distdir %>/DesktopInit.min.js"
				}
			},
			desktopCSS: {
				options: {
					optimizeCss: "standard",
					cssIn: "src/css/desktop.css",
					out: "<%= distdir %>/css/desktop.min.css"
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'src/app/**/*.js'],
			options: {
				globals: {
					jQuery: true,
					console: false,
					module: true,
					document: true
				}
			}
		},

		watch:{
			all: {
				files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
				tasks:['default','timestamp']
			},
			build: {
				files:['<%= src.js %>', '<%= src.specs %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
				tasks:['build','timestamp']
			}
		},

		/*jshint:{
			files:['gruntFile.js', '<%= src.js %>', '<%= src.specs %>', '<%= src.scenarios %>'],
			options:{
				curly:true,
				eqeqeq:true,
				immed:true,
				latedef:true,
				newcap:true,
				noarg:true,
				sub:true,
				boss:true,
				eqnull:true,
				globals:{}
			}
		}*/

	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('build', ['requirejs:desktopJS', 'requirejs:mobileJS', 'requirejs:desktopCSS', 'requirejs:mobileCSS']);
	grunt.registerTask('default', ['test', 'build']);
};
