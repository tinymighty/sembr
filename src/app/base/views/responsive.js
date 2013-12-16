define(['sembr', 'jquery', 'backbone', 'marionette', 'base/views/header', 
'semantic-ui',
'hbs!../templates/responsive'],
function (sembr, $, Backbone, Marionette, HeaderView, SemanticUI, template) {
    //ItemView provides some default rendering logic
    return Backbone.Marionette.Layout.extend({
        template:template,

        attributes: {'data-role': "layout"},

        events:{
            'click a': 'preventDefault'
        },
        
        regions:{
            header: '[data-role="header"]',
            content: '[data-role="content"]',
            footer: '[data-role="footer"]'
        },

        initialize: function(){
            this.headerView = new HeaderView();
        },

        onRender: function(){
            this.header.show( this.headerView );
        },

        preventDefault: function($ev){
            $ev.preventDefault();
            return false;
        }

    });
});