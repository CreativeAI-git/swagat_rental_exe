const si = require("systeminformation");

async function collectSystemInfo() {
  const [
    osInfo,
    cpu,
    mem,
    diskLayout,
    network,
    baseboard,
    bios
  ] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.mem(),
    si.diskLayout(),
    si.networkInterfaces(),
    si.baseboard(),
    si.bios()
  ]);

  return {
    osInfo,
    cpu,
    mem,
    diskLayout,
    network,
    baseboard,
    bios
  };
}

module.exports = { collectSystemInfo };
