const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const collectData = require("../utils/system_info_collector");
const { generateHardwareFingerprint } = require("../utils/fingerprint");
const { saveSystemIdentity } = require("../utils/system_identity_storage")


const MAP_API_URL = "https://api.creativethoughts.ai/api/user/mapSystem";
const REGISTER_API = "https://api.creativethoughts.ai/api/user/registerSystem";


async function startRegistration() {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "../views/registration.html");
    res.send(fs.readFileSync(filePath, "utf8"));
  });

  app.post("/register", async (req, res) => {
    try {
      const collectedData = await collectData();
      const fingerprint = await generateHardwareFingerprint();

      const autoAssets = collectedData.assets;

      const manualAssets = [
        {
          category: "Monitor",
          brand: req.body.monitor_brand || null,
          serial: req.body.monitor_serial || null,
          model: null,
          spec_json: {}
        },
        {
          category: "Keyboard",
          brand: req.body.keyboard_brand || null,
          serial: req.body.keyboard_serial || null,
          model: null,
          spec_json: {}
        },
        {
          category: "Mouse",
          brand: req.body.mouse_brand || null,
          serial: null,
          model: null,
          spec_json: {}
        }
      ].filter(a => a.brand);
      
      const payload = {
        client_id: req.body.client_id,
        hardware_fingerprint: fingerprint,
        system_info: collectedData.system_info,
        assets: [...autoAssets, ...manualAssets]
      };
      

      const response = await axios.post(REGISTER_API, payload, {
        timeout: 15000
      });

      const systemId = response.data?.system_id;

      if (!systemId) {
        throw new Error("System ID not returned from backend");
      }

      await saveSystemIdentity(systemId, fingerprint);

      res.send(successPage());
      setTimeout(() => process.exit(0), 2000);

    } catch (err) {
      console.error("Registration error:", err.message);
      res.send(errorPage());
      setTimeout(() => process.exit(1), 2000);
    }
  });

  const server = app.listen(0, () => {
    const port = server.address().port;
    exec(`start http://localhost:${port}`);
  });
}


function successPage() {
  return `
  <html>
  <body style="font-family:Arial;text-align:center;padding-top:100px;">
    <h2 style="color:green;">✅ Registration Successful</h2>
    <p>You can close this window.</p>
  </body>
  </html>`;
}

function errorPage() {
  return `
  <html>
  <body style="font-family:Arial;text-align:center;padding-top:100px;">
    <h2 style="color:red;">❌ Registration Failed</h2>
    <p>Please check your Client ID.</p>
  </body>
  </html>`;
}

module.exports = { startRegistration };
