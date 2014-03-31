"use strict";
require.config({
    baseUrl:"/app",

    paths:{
        "normalize": "../../bower_components/require-less/normalize",
        "text": "../libs/require/plugins/text",
        "hbs": "../libs/require/plugins/hbs",
        "rv": "../libs/require/plugins/rv",
        "css": "../libs/require/plugins/css",
        "less": "../../bower_components/require-less/less",
        "lessc": "../../bower_components/require-less/lessc",

        // Core Libraries
        'init': 'init',
        "sembr": "core/sembr",
        "sembr.error": 'core/error',
        "sembr.modulerouter": "core/module-router",
        "sembr.module": "core/module",
        "sembr.controller": "core/controller",
        "sembr.collection": 'core/collection',
        "sembr.model": 'core/model',
        "sembr.hoodup": 'core/hoodup',
        "sembr.ractive": 'core/ractive',



        "sembr.ractiveview": 'core/ractive-view',

        "sembr.mixins.readypromise": 'core/mixins/readypromise',
        'sembr.promises': 'core/promises',

        "sembr.base": 'base/module',
        "sembr.default": 'default/module',
        "sembr.trackr": 'trackr/module',

        "jquery":"../libs/jquery/jquery",
        "underscore":"../libs/lodash",
        "backbone":"../libs/backbone/backbone",
        "marionette":"../libs/backbone/backbone.marionette",

        "backbone-undo":"../libs/backbone/backbone.undo",
        "backbone.deep-model":"../libs/backbone/backbone.deep-model",
        "supermodel":"../libs/backbone/supermodel",
        "backbone-validation": "../../bower_components/backbone-validation/dist/backbone-validation-amd",

        "hoodie": "/_api/_files/hoodie",

        "ractive": "../../bower_components/ractive/build/Ractive",
        "ractive.backbone": "../libs/ractive/adaptors/Backbone",
        //"ractive.ractive": "../libs/ractive/adaptors/Ractive",

        "picker": "../libs/pickadate.js-3.4.0/picker",
        "pickadate": "../libs/pickadate.js-3.4.0/picker.date",
        "pickatime": "../libs/pickadate.js-3.4.0/picker.time",


        "pouchdb": "../libs/pouchdb",

        "moment": "../libs/moment",

        "handlebars":"../libs/handlebars",

        "i18nprecompile":"../libs/i18nprecompile",
        "json2":"../libs/json2",

        "jasmine": "../test/lib/jasmine-1.3.1/jasmine",
        "jasmine-html": "../test/lib/jasmine-1.3.1/jasmine-html",

        "semantic-ui": "../libs/semantic-ui/javascript/semantic",

        //search
        "lunr":"../libs/lunr/lunr",

        //language processing libraries
        "natural":"../libs/natural/natural",
        "snowball":"../libs/snowball/snowball",

        // Plugins        
        "puton": "../libs/puton/puton",

        //The various awesome Hubspot libs
        //AMD support is flakey, custom wrappers in ../libs define dependencies
        //and autoload CSS dependencies
        "tether": "../libs/wrappers/tether",
        "drop": "../libs/wrappers/drop", //a wrapper which also loads the css!
        "tooltip": "../libs/wrappers/tether-tooltip",

        "tether-main": "../../bower_components/tether/tether",
        "drop-main": "../../bower_components/drop/js/drop", //a wrapper which also loads the css!
        "tooltip-main": "../../bower_components/tether-tooltip/js/tooltip",
        "vex": "../../bower_components/vex/js/vex",
        "vex.dialog": "../../bower_components/vex/js/vex.dialog",

        //An awesome type-down selector
        "selectize": "../../bower_components/selectize/dist/js/standalone/selectize",
        //"selectize-wrapper": "../libs/wrappers/selectize"
    },
    // Sets the configuration for your third party scripts that are not AMD compatible
    shim:{
        "tether-main": {
            "exports": "Tether"
        },
        "drop-main": {
            "deps": ['tether-main'],
            "exports": "Drop"
        },
        "tooltip-main": {
            "deps": ['tether-main', 'drop-main'],
            "exports": "Tooltip"
        },
        "semantic-ui":{ "deps": ["jquery"] },

        "backbone":{
            // Depends on underscore/lodash and jQuery
            "deps":["underscore", "jquery"],
            // Exports the global window.Backbone object
            "exports":"Backbone"
        },

        "backbone.deep-model":{ "deps":["backbone"] },

        //Marionette
        "marionette":{
            "deps":["underscore", "backbone", "jquery"],
            "exports": "Marionette"
        },
        //Handlebars
        "handlebars":{
            "exports":"Handlebars"
        },
        // Backbone.validateAll plugin that depends on Backbone
        //"backbone.validateAll":["backbone"],

        "hoodie":{
            "exports": "Hoodie"
        },

        //CSS dependencies for pickadate
        "pickadate": ["css!../libs/pickadate.js-3.4.0/themes/default", "css!../libs/pickadate.js-3.4.0/themes/default.date" ],
        "pickatime": ["css!../libs/pickadate.js-3.4.0/themes/default", "css!../libs/pickadate.js-3.4.0/themes/default.time"],

        //CSS dependencies for Vex
        "vex": ['css!../../bower_components/vex/css/vex.css', 
                'css!../../bower_components/vex/css/vex-theme-flat-attack.css'],

        //CSS dependencies for selectize
        "selectize": ['css!../bower_components/selectize/dist/css/selectize.css',
                      'css!../bower_components/selectize/dist/css/selectize.default.css'],


        "jasmine": {
            "exports": "jasmine"
        },

        "jasmine-html": {
            "deps": ["jasmine"],
            "exports": "jasmine"
        },

        "puton":{
            "exports": "Puton"
        },
        "lunr": {
            "exports": "lunr"
        },
        "natural": {
            "exports": "natural"
        },
        "snowball": {
            "exports": "Snowball"
        }
    },

    map: {
        /*'*': {
            'selectize': 'selectize-wrapper'
        },
        'selectize': {
            'selectize': 'selectize'
        }*/
    },

    // hbs config - must duplicate in Gruntfile.js Require build
    hbs: {
        templateExtension: "html",
        //helperDirectory: "templates/helpers/",
        i18nDirectory: "i18n/",

        compileOptions: {}        // options object which is passed to Handlebars compiler
    }
});

require(['init'], function(init){
    init({environment: 'development'});
});
