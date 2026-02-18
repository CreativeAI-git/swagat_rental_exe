const crypto = require("crypto");

function generateFingerprint(baseboard, bios, diskLayout) {
  const raw = `
    ${baseboard.serial || ""}
    ${bios.serial || ""}
    ${diskLayout[0]?.serialNum || ""}
  `;

  return crypto.createHash("sha256").update(raw).digest("hex");
}

module.exports = { generateFingerprint };
