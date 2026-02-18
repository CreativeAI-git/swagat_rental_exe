const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { getOrCreateSystemId } = require("../utils/utils");

const MAP_API_URL = "https://api.creativethoughts.ai/api/user/mapSystem";

function startRegistration() {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "../views/registration.html");
    const html = fs.readFileSync(filePath, "utf8");
    res.send(html);
  });

  app.post("/register", async (req, res) => {
    const clientId = req.body.client_id;
    const systemId = getOrCreateSystemId();

    try {
      await axios.post(MAP_API_URL, {
        system_id: systemId,
        client_id: clientId
      });

      res.send(successPage());
      setTimeout(() => process.exit(0), 2000);

    } catch (err) {
      res.send(errorPage());
      setTimeout(() => process.exit(1), 2000);
    }
  });

  app.listen(4000, () => {
    exec("start http://localhost:4000");
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
