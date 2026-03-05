const axios = require("axios");
const collectData = require("../utils/system_info_collector");
const { readSystemIdentity } = require("../utils/system_identity_storage");

const API_URL = "http://187.124.99.24:8010/api/user/systemSnapshot";
// const API_URL = "http://192.168.1.48:8010/api/user/systemSnapshot";

let isSending = false;

async function sendToServer() {
  if (isSending) return;
  isSending = true;

  try {
    const identity = readSystemIdentity();

    if (!identity || !identity.system_id) {
      console.log("⚠ System not registered. Run --register first.");
      return;
    }

    const systemId = identity.system_id;

    const snapshot = await collectData();

    console.log("📡 Sending snapshot for:", systemId);

    await axios.post(
      API_URL,
      {
        system_id: systemId,
        snapshot: snapshot
      },
      { timeout: 15000 }
    );

    console.log("✅ Snapshot sent successfully");

  } catch (err) {
    console.error("❌ Agent Error:", err.message);
  } finally {
    isSending = false;
  }
}

function startAgent() {
  console.log("🚀 Swagat Inventory Agent Started");
  
  // First immediate send
  sendToServer();

  // Every 5 minutes
  setInterval(sendToServer, 5 * 60 * 1000);
}

module.exports = { startAgent };
