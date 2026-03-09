const crypto = require("crypto");
const si = require("systeminformation");

function clean(value) {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
}

async function generateHardwareFingerprint() {
  const [system, baseboard, bios, cpu] = await Promise.all([
    si.system(),
    si.baseboard(),
    si.bios(),
    si.cpu()
  ]);

  const rawFingerprint = [
    clean(system.uuid),
    clean(baseboard.serial),
    clean(bios.serial),
    clean(baseboard.model)
  ].join("|");

  const fingerprint = crypto
    .createHash("sha256")
    .update(rawFingerprint)
    .digest("hex");

  return fingerprint;
}

module.exports = { generateHardwareFingerprint };