const Service = require("node-windows").Service;
const path = require("path");

const svc = new Service({
  name: "SwagatInventoryAgent",
  description: "Swagat Rental Inventory Monitoring Service",
  script: path.join(__dirname, "..", "index.js"),
  nodeOptions: [],
  wait: 2,
  grow: 0.5,
  maxRestarts: 10
});

svc.on("install", function () {
  console.log("Service Installed");
  svc.start();
});

svc.install();
