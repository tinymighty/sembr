define(['sembr', 'jquery', 'backbone', 'marionette', 'hbs!../templates/header'],
    function (sembr, $, Backbone, Marionette, template) {
        //ItemView provides some default rendering logic
        return Backbone.Marionette.ItemView.extend({
            template:template,

            events: {
            	'click a': 'menuClick'
            },

            currentModule: '',

            initialize:function(){
                this.listenTo(sembr.vent, 'route', function(name, params, module){
                    this.currentModule = module;
                    this.setActiveItem(module);
                });
            },

            onRender: function(){

            },

            setActiveItem: function(module){
                sembr.log('Setting menu item', module);
                this.$('#main-menu li').removeClass('active').filter('[data-activate='+module+']').addClass('active');
            },


            menuClick: function($ev){
            	$ev.preventDefault();
            	sembr.navigate($($ev.target).attr('href'), {trigger:true});
            }
        });
    });