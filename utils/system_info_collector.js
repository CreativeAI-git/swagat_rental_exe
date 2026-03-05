
const si = require("systeminformation");

async function collectData() {
    const [
      osInfo,
      cpu,
      mem,
      memLayout,
      diskLayout,
      graphics,
      baseboard,
      bios,
      battery,
      networkInterfaces
    
    ] = await Promise.all([
      si.osInfo(),
      si.cpu(),
      si.mem(),
      si.memLayout(),
      si.diskLayout(),
      si.graphics(),
      si.baseboard(),
      si.bios(),
      si.battery(),
      si.networkInterfaces()
    ]);
  
    const deviceType = battery.hasBattery ? "Laptop" : "Desktop";
    const assets = [];
    const activeNetwork = networkInterfaces.find(
      n => !n.internal && n.ip4
    );
    /* CPU */
    assets.push({
      category: "CPU",
      brand: cpu.manufacturer,
      model: cpu.brand,
      serial: null,
      spec_json: {
        cores: cpu.physicalCores,
        threads: cpu.cores,
        speedGHz: cpu.speed,
        socket: cpu.socket
      }
    });
  
    /* Motherboard */
    assets.push({
      category: "Motherboard",
      brand: baseboard.manufacturer,
      model: baseboard.model,
      serial: baseboard.serial || null,
      spec_json: {
        version: baseboard.version,
        bios_version: bios.version
      }
    });
  
    /* Storage */
    diskLayout.forEach(d => {
      assets.push({
        category: d.type === "SSD" ? "SSD" : "HDD",
        brand: d.vendor,
        model: d.name,
        serial: d.serialNum || null,
        spec_json: {
          sizeGB: (d.size / (1024 ** 3)).toFixed(2),
          interface: d.interfaceType,
          firmware: d.firmwareRevision
        }
      });
    });
  
    /* RAM */
    memLayout.forEach(r => {
      assets.push({
        category: "RAM",
        brand: r.manufacturer,
        model: r.type,
        serial: r.serialNum || null,
        spec_json: {
          sizeGB: (r.size / (1024 ** 3)).toFixed(2),
          clockSpeed: r.clockSpeed
        }
      });
    });
  
    /* GPU */
    graphics.controllers.forEach(g => {
      assets.push({
        category: "GPU",
        brand: g.vendor,
        model: g.model,
        serial: null,
        spec_json: {
          vramMB: g.vram,
          driverVersion: g.driverVersion,
          bus: g.bus
        }
      });
    });
  
    /* Monitor */
    graphics.displays.forEach(display => {
      let approxSize = null;
    
      if (display.sizeX && display.sizeY) {
        const diagonal = Math.sqrt(
          display.sizeX ** 2 + display.sizeY ** 2
        );
    
        // Heuristic: if value looks large → probably mm
        if (display.sizeX > 100 || display.sizeY > 100) {
          approxSize = (diagonal / 25.4).toFixed(1);
        } 
        // else assume cm
        else {
          approxSize = (diagonal / 2.54).toFixed(1);
        }
      }
    
      assets.push({
        category: "Monitor",
        brand: display.vendor || null,
        model: display.model || null,
        serial: display.serial || null,
        spec_json: {
          resolution: display.currentResX && display.currentResY
            ? `${display.currentResX}x${display.currentResY}`
            : null,
          approx_size_inches: approxSize,   // 👈 renamed
          main_display: display.main
        }
      });
    });
    const systemInfo = {
      device_type: deviceType,
      os: osInfo.distro,
      hostname: osInfo.hostname,
      total_ram_gb: (mem.total / (1024 ** 3)).toFixed(2),
      motherboard_serial: baseboard.serial,
      mac_address: activeNetwork?.mac || null,
      ip_address: activeNetwork?.ip4 || null
    };
    
    return {
      system_info: systemInfo,
      assets
    };
  }


  module.exports = collectData;