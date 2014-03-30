define( 
[
	'require', 
	'tether',
	'drop',
	'tooltip-main',
	'css!../bower_components/tether-tooltip/css/tooltip-theme-arrows.css'
],	
function(require, Tether, Drop, Tooltip){
	window.Tooltip = Tooltip;
	return Tooltip;
});