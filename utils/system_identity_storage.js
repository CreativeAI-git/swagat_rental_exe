const fs = require("fs");
const path = require("path");

function getStoragePath() {
  const basePath = process.env.PROGRAMDATA
    ? path.join(process.env.PROGRAMDATA, "SwagatInventory")
    : __dirname;

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  return path.join(basePath, "system-identity.json");
}

function saveSystemIdentity(systemId, fingerprint) {
  const file = getStoragePath();

  fs.writeFileSync(
    file,
    JSON.stringify({
      system_id: systemId,
      hardware_fingerprint: fingerprint
    }, null, 2)
  );
}

function readSystemIdentity() {
  const file = getStoragePath();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

module.exports = {
  saveSystemIdentity,
  readSystemIdentity
};
