const cds = require("@sap/cds");
const Destination = require('./src/destination.js')
const xsenv = require('@sap/xsenv')
const cfenv = require('cfenv');
var destinations = []

function to(cfDestination) {
    let cfServicesList = xsenv.readCFServices()
    let vcapServices = cfenv.getAppEnv().getServices();
    let cfServiceName = 'destination'


    const scpDestinations = new(require('./lib/scp-destinations.js'))(cfServiceName)
	return new Promise(async (resolve, reject) => {
        var destination = destinations.find(x => { return x.name == 'cfDestination'})
        if (destination !== undefined && destination.length > 0){
            return destination[0].value();
        }
        var scp_dest = await  scpDestinations.__proto__.readDestination(cfDestination);
		if (scp_dest.status!=200) {
		 	reject(new Error(`CDS-API: Missing destination configuration for ${cfDestination}!`));
        }
        destination = {}
        destination.name = cfDestination
        destination.value = new Destination(scp_dest.data.destinationConfiguration)
        destinations.push(destination)
         resolve(destination.value)
	});
}


module.exports = {
	connect: {
		to: to
	}
};