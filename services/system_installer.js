const Service = require("node-windows").Service;
const path = require("path");

const exePath = path.join(__dirname, "InventoryAgent.exe");

const svc = new Service({
  name: "SwagatInventoryAgent",
  description: "Swagat Rental Inventory Monitoring Service",
  script: exePath,
  workingDirectory: __dirname
});

svc.on("install", function () {
  svc.start();
});

svc.install();
