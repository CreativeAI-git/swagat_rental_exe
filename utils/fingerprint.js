const crypto = require("crypto");
const si = require("systeminformation");

function clean(value) {
  if (!value) return "";
  return value.toString().trim();
}

async function generateHardwareFingerprint() {
  const [baseboard, bios, os] = await Promise.all([
    si.baseboard(),
    si.bios(),
    si.osInfo()
  ]);

  const raw = [
    clean(baseboard.serial),
    clean(bios.serial),
    clean(os.hostname)
  ].join("|");

  return crypto.createHash("sha256").update(raw).digest("hex");
}

module.exports = { generateHardwareFingerprint };
