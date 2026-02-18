const { startRegistration } = require("./services/registrationService.js");
const { startAgent } = require("./services/agentService.js");

const args = process.argv.slice(2);

if (args.includes("--register")) {
  startRegistration();
} else {
  startAgent();
}
