const si = require("systeminformation");
const axios = require("axios");
const { getOrCreateSystemId } = require("../utils/utils");

const API_URL = "https://api.creativethoughts.ai/api/user/addPCInfo";

let isSending = false;

async function collectData() {
  return {
    os: await si.osInfo(),
    cpu: await si.cpu(),
    ram: await si.mem(),
    disk: await si.diskLayout(),
    network: await si.networkInterfaces(),
    motherboard: await si.baseboard(),
    bios: await si.bios()
  };
}

async function sendToServer() {
  if (isSending) return;
  isSending = true;

  try {
    const data = await collectData();
    const systemId = getOrCreateSystemId();

    await axios.post(API_URL, {
      system_id: systemId,
      json: data
    });

    console.log("✅ Data Sent");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    isSending = false;
  }
}

function startAgent() {
  sendToServer();
  setInterval(sendToServer, 5 * 60 * 1000);
}

module.exports = { startAgent };
