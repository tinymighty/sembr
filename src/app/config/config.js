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
        // Core Libraries
        'init': 'init',
        "sembr": "core/sembr",
        "sembr.error": 'core/error',
        "sembr.modulerouter": "core/module-router",
        "sembr.module": "core/module",
        "sembr.controller": "core/controller",
        "sembr.collection": 'core/collection',
        "sembr.model": 'core/model',
        "sembr.sync.pouch": 'core/sync.pouch',
        "sembr.hoodup": 'core/hoodup',

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
        "backbone.pouch":"../libs/backbone/backbone.pouch.promises",
        //"backbone-deepModel":"../libs/backbone/backbone.deep-model",
        "backbone.collectionbinder":"../libs/backbone/backbone.collectionbinder",
        "backbone.modelbinder":"../libs/backbone/backbone.modelbinder",
        "backbone.forms":"../libs/backbone/backbone.forms",
        "backbone.deep-model":"../libs/backbone/backbone.deep-model",
        "backbone.relational":"../libs/backbone/backbone.relational",
        "backbone.supermodel":"../libs/backbone/backbone.supermodel",

        "hoodie": "/_api/_files/hoodie",
        "backbone-hoodie": "../libs/backbone/backbone-hoodie",

        "pouchdb": "../libs/pouchdb",

        "underscore": "../libs/lodash",
        "handlebars":"../libs/handlebars",
        "hbs":"../libs/hbs",
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
        //"bootstrap":"../libs/require/bootstrap",
        "text":"../libs/require/plugins/text",
        "jasminejquery": "../libs/require/jasmine-jquery",

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
        /*"backbone.pouch":{
            "deps":["backbone", "pouchdb", "underscore", "jquery"],
            "exports":"BackbonePouch"
        },*/
        "backbone.collectionbinder":{
            "deps":["backbone", "backbone.modelbinder"]
        },
        "backbone.modelbinder":{
            "deps":["backbone"],
        },
        "backbone.deep-model":{ "deps":["backbone"] },
        "backbone.relational":{ "deps":["backbone"] },
        "backbone.supermodel":{ 
            "deps":["backbone", "underscore"],
            "exports": "Supermodel"
        },

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
        "pouchdb":{
            "exports": "PouchDB"
        },

        "jasmine": {
            "exports": "jasmine"
        },

        "jasmine-html": {
            "deps": ["jasmine"],
            "exports": "jasmine"
        },

        "timelinejs": {
            "deps": ["jquery"],
            "exports": "createStoryJS"
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