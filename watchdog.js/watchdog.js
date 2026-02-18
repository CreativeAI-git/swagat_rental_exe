const { exec } = require("child_process");

setInterval(() => {
  exec('tasklist', (err, stdout) => {
    if (!stdout.includes("inventory-agent.exe")) {
      exec('start inventory-agent.exe');
    }
  });
}, 30000);
