const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const collectData = require("../utils/system_info_collector");
const { generateHardwareFingerprint } = require("../utils/fingerprint");
const { saveSystemIdentity } = require("../utils/system_identity_storage")

const REGISTER_API = "http://187.124.99.24:8010/api/user/registerSystem";
// const REGISTER_API = "http://192.168.1.48:8010/api/user/registerSystem";


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
     
    
      let autoAssets = collectedData.assets || [];
      
      /* --------------------------
         🔹 Merge Manual Monitor
      ---------------------------*/
      
      // Find primary auto monitor (prefer main_display)
      const monitorIndex = autoAssets.findIndex(
        a =>
          a.category === "Monitor" &&
          (a.spec_json?.main_display === true || true)
      );
      
      if (req.body.monitor_brand || req.body.monitor_serial) {
        if (monitorIndex !== -1) {
          // ✅ Merge into existing auto monitor
          autoAssets[monitorIndex] = {
            ...autoAssets[monitorIndex],
            brand:
              req.body.monitor_brand ||
              autoAssets[monitorIndex].brand ||
              null,
            serial:
              req.body.monitor_serial ||
              autoAssets[monitorIndex].serial ||
              null,
              size : req.body.monitor_size || null
          };
        } else {
          // ✅ No auto monitor detected → create new
          autoAssets.push({
            category: "Monitor",
            brand: req.body.monitor_brand || null,
            serial: req.body.monitor_serial || null,
            size : req.body.monitor_size || null,
            model: null,
            spec_json: {}
          });
        }
      }
      
      /* --------------------------
         🔹 Add Manual Keyboard
      ---------------------------*/
      
      if (req.body.keyboard_brand) {
        autoAssets.push({
          category: "Keyboard",
          brand: req.body.keyboard_brand,
          serial: req.body.keyboard_serial || null,
          model: null,
          spec_json: {}
        });
      }
      
      /* --------------------------
         🔹 Add Manual Mouse
      ---------------------------*/
      
      if (req.body.mouse_brand) {
        autoAssets.push({
          category: "Mouse",
          brand: req.body.mouse_brand,
          serial: null,
          model: null,
          spec_json: {}
        });
      }
      
      /* --------------------------
         🔹 Final Payload
      ---------------------------*/
      
      const payload = {
        client_id: req.body.client_id,
        hardware_fingerprint: fingerprint,
        system_info: collectedData.system_info,
        assets: autoAssets
      };

      const response = await axios.post(REGISTER_API, payload, {
        timeout: 15000
      });
  
      const systemId = response.data?.system_uuid;

      if (!systemId) {
        throw new Error("System ID not returned from backend");
      }

      await saveSystemIdentity(systemId, fingerprint);

      res.send(successPage());
      setTimeout(() => process.exit(0), 2000);

    } catch (err) {
        console.error("Registration error:", err.message);
      
        let backendMessage = "Registration failed. Please try again.";
      
        if (err.response && err.response.data) {
          backendMessage =
            err.response.data.message ||
            err.response.data.error ||
            backendMessage;
        } else if (err.message) {
          backendMessage = err.message;
        }
      
        res.send(errorPage(backendMessage));
        setTimeout(() => process.exit(1), 3000);
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

function errorPage(message) {
  return `
  <html>
  <body style="font-family:Arial;text-align:center;padding-top:100px;">
    <h2 style="color:red;">❌ Registration Failed</h2>
    <p>${message}</p>
  </body>
  </html>`;
}

module.exports = { startRegistration };
