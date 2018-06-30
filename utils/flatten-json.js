/**
*
* @description script to read in a google discovery JSON file, and flatten out the properties into CSV
* @param {string} arg1 - for command line argument is the name of the JSON file to read
*/

var fs = require('fs');

if (! process.argv[2]) {
	console.log('Need file');
	return;
}

var data = fs.readFileSync(__dirname + '/' + process.argv[2]);
var jsdata = JSON.parse(data);
var obj = jsdata.schemas.Person.properties;

/**
* @description gets the properties of 'obj', with a name prefix of 'prefix'
* @param {string} prefix - the name to prefix to any properties found (for recursion)
* @param {string} obj - the starting object within the file to start searching
*/
function getProps(prefix, obj) {
	var values = [];

	/**
	* loop through all the keys extracted from the object
	*/
	Object.keys(obj).forEach(function(key, index) {
		var type = 'object', desc = '';
		
		var names = [];
		if (prefix) {
			names.push(prefix);
		}
		names.push(key);

		if (obj[key].type) {
			type = obj[key].type;
		}

		/**
		* if there is an 'items' object, then look in there for either
		* a '$ref' to other object, or to get the 'type' of the property
		* If no 'items' object, then check if there is a '$ref' or 'type'
		*/
		if (obj[key].hasOwnProperty('items')) {

			if (obj[key].items.hasOwnProperty('$ref')) {
					var v = obj[key].items['$ref'];
					getProps(names.join('.'), jsdata.schemas[v].properties).forEach(function(kk, ii) {
						names.push(kk);
						values.push(kk);
					});
			} else if (obj[key].items.hasOwnProperty('type')) {
				values.push(names.join('.') + ',' + obj[key].items.type);
			}
		} else if (obj[key].hasOwnProperty('$ref')) {
			var v = obj[key]['$ref'];
			getProps(names.join('.'), jsdata.schemas[v].properties).forEach(function(kk, ii) {
				// names.push(kk);

				names.push(kk);
				values.push(kk);
			});
		} else if (obj[key].hasOwnProperty('type')) {
				values.push(names.join('.') + ',' + obj[key].type);
		} else {

			values.push(names.join('.') + ',' + type);
		}
	
	});

	return values;
}

console.log(getProps('', obj).join('\n'));