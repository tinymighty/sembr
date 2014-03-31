define(['sembr', 'jquery', 'backbone', 'marionette', 'tooltip', 'hbs!../templates/navigation'],
    function (sembr, $, Backbone, Marionette, Tooltip, template) {
        //ItemView provides some default rendering logic
        return Backbone.Marionette.ItemView.extend({
            template:template,

            events: {
            	'click .menu a': 'menuClick',
                'click #sign-in': 'signIn',
                'click #sign-out': 'signOut'
            },

            ui:{
                'signIn': '#sign-in',
                'signOut': '#sign-out'
            },

            currentModule: '',

            initialize:function(){
                this.listenTo(sembr.vent, 'route', function(name, params, module){
                    this.currentModule = module;
                    this.setActiveItem(name);
                });
            },

            onRender: function(){
                if( sembr.hoodie.account.hasAccount() ){
                    this.ui.signIn.hide();
                    this.ui.signOut.show();
                }else{
                    this.ui.signIn.show();
                    this.ui.signOut.hide();
                }
                //Tooltip.init();
                this.$('.item').each(function(i, el){
                    
                    var tip = new Tooltip({
                      target: el,
                      position: 'right middle',
                      content: $(el).text(),
                      classes: 'sembr-menu'
                    });
                    $(el).mouseover(function(event) {
                        tip.open();
                    });
                    $(el).mouseout(function(event) {
                        tip.close();
                    });
                });
                
            },

            setActiveItem: function(route_name){
                sembr.log('Setting menu item', name, window.location.pathname, this.$('.item').filter('[href="'+window.location.pathname+'"]'));
                this.$('.item').removeClass('active').filter('[href="'+window.location.pathname+'"]').addClass('active');
            },


            menuClick: function($ev){
                console.log('Click!', $ev);
            	$ev.preventDefault();
                if( $($ev.currentTarget).attr('href')  ){
            	   sembr.navigate($($ev.currentTarget).attr('href'), {trigger:true});
                }
            },

            signIn: function(){
                var that = this;
                var credentials = prompt('Enter your login details (user:password)', 'andru:andru');

                credentials = credentials.split(':');
                console.log('Signing in with credentials', credentials);
                sembr.hoodie.account.signIn(credentials[0], credentials[1])
                .then(function(){
                    console.log('Sign in returned.', arguments);
                    that.ui.signOut.show();
                    that.ui.signIn.hide();
                });
                    
            },

            signOut: function(){
                sembr.hoodie.account.signOut();
                this.ui.signIn.show();
                this.ui.signOut.hide();
            }
        });
    });