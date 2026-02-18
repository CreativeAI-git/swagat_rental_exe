const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function getOrCreateSystemId() {
    try {
      const basePath = path.dirname(process.execPath); // 👈 important
      const ID_FILE = path.join(basePath, "system-id.json");
  
      if (fs.existsSync(ID_FILE)) {
        const data = JSON.parse(fs.readFileSync(ID_FILE));
        return data.system_id;
      }
  
      const newId = crypto.randomUUID();
      fs.writeFileSync(ID_FILE, JSON.stringify({ system_id: newId }));
  
      return newId;
    } catch (err) {
      console.error("System ID error:", err.message);
      return null;
    }
  }

module.exports = { getOrCreateSystemId };
