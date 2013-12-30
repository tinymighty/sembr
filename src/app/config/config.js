require.config({
    baseUrl:"/app",

    /*packages: [
        'core',
        'layout'
        'default',
        'trackr'
    ],
*/
    // 3rd party script alias names (Easier to type "jquery" than "libs/jquery, etc")
    // probably a good idea to keep version numbers in the file names for updates checking
    paths:{
        "text":"../libs/require/plugins/text",
        "hbs":"../libs/require/plugins/hbs",
        "rv": "../libs/require/plugins/rv",
        "css": "../libs/require/plugins/css",

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
        "jquerymobile":"../libs/jquery/jquery.mobile",
        "underscore":"../libs/lodash",
        "backbone":"../libs/backbone/backbone",
        "marionette":"../libs/backbone/backbone.marionette",

        "backbone.deep-model":"../libs/backbone/backbone.deep-model",
        "supermodel":"../libs/backbone/supermodel",

        "hoodie": "/_api/_files/hoodie",

        "ractive": "../libs/ractive/Ractive",
        "ractive.backbone": "../libs/ractive/adaptors/Backbone",
        //"ractive.ractive": "../libs/ractive/adaptors/Ractive",

        "pouchdb": "../libs/pouchdb",

        "underscore": "../libs/lodash",
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
        "puton": "../libs/puton/puton"
    },
    // Sets the configuration for your third party scripts that are not AMD compatible
    shim:{
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
    // hbs config - must duplicate in Gruntfile.js Require build
    hbs: {
        templateExtension: "html",
        //helperDirectory: "templates/helpers/",
        i18nDirectory: "i18n/",

        compileOptions: {}        // options object which is passed to Handlebars compiler
    }
});
