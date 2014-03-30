define(
[
	'require',
	'tether-main', 
	'css!../bower_components/tether/css/tether-theme-arrows-dark.css',
	'css!../bower_components/tether/css/tether-theme-arrows.css',
	'css!../bower_components/tether/css/tether-theme-basic.css'
], 
function(require, Tether){
	window.Tether = Tether;
	return Tether;
});