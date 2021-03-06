var Path = require('path');
var fs = require('fs');
var os = require("os");
require(Path.resolve("./Frame.js"));

var ServicesManager = useRoot("System/ServicesManager");

Frame.getPort = function () {
	return Frame._availablePort++;
};

Frame.portsStart = 5600;
Frame._availablePort = Frame.portsStart;

Frame._initFrame = function () {
    console.log("Starting ILAB v 3.0.78");
	try {
		process.setMaxListeners(100);

		var wd = process.argv[2];

		Frame.servicesManagerPort = Frame.getPort();
		var services = new ServicesManager(Frame.servicesManagerPort);
        services.on("error", function (err) {
            if (err.serviceId) {
                console.log("Service error: "  + err.serviceId);
            }
            console.error(err);
        });
        /*
		spawnMon.on("virtual-start", function (options) {
			console.log("Spawn service started with:");
			console.log(options);
		});
		spawnMon.on("virtual-stop", function (options) {
			console.log("Spawn service stopped.");
		});
		spawnMon.on("error", function (err) {
			console.error(err);
		});
		spawnMon.on("virtual-output", function (data) {
			console.log(data);
		});*/
		services.StartService("NodesManagerService").then(function() {
			return services.GetService("NodesManagerService")
				.then(function(nodesManager) {
					if (process.argv[2]) {
						return services.StartService(process.argv[2]).then(function () {
							console.log("My " + process.argv[2] + " started!");
							return nodesManager;
						})
					} else {
						return nodesManager;
					}
				})
				.then(function(nodesManager) {
					return nodesManager.StartNode("./Services/ServicesHttpProxy").then(function() {
						console.log("All started!");
					});
				})
		}).catch(function(err) {
			console.error(err);
		});

		/*setInterval(function() {
		 console.log(new Date());
		 }, 5000);*/
	}
	catch (err) {
        console.log("RootError: ");
		console.error(err.stack);
	}
};

Frame._initFrame();