define(
[
	'require',
	'tether', 
	'drop-main',
	//themes
	'css!../bower_components/drop/css/drop-theme-arrows-bounce-dark.css',
	'css!../bower_components/drop/css/drop-theme-arrows-bounce.css',
	'css!../bower_components/drop/css/drop-theme-arrows.css',
	'css!../bower_components/drop/css/drop-theme-basic.css',
	'css!../bower_components/drop/css/drop-theme-hubspot-popovers.css'
], 
function(require, Tether, Drop){
	window.Drop = Drop;
	return Drop;
});