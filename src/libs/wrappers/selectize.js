define( 
[
	'require', 
	'selectize',
	'css!../bower_components/selectize/dist/css/selectize.css',
	'css!../bower_components/selectize/dist/css/selectize.default.css',
],	
function(require, Selectize){
	console.log("SELECTIZE!!!", Selectize);
	return Selectize;
});