const axios = require("axios");
const { SERVER_URL, AGENT_TOKEN } = require("../config/config");

async function sendHeartbeat() {
  try {
    await axios.post(`${SERVER_URL}/agent/heartbeat`, {
      status: "alive",
      time: new Date()
    }, {
      headers: { "x-agent-token": AGENT_TOKEN }
    });

    console.log("💓 Heartbeat Sent");
  } catch (err) {
    console.log("Heartbeat failed");
  }
}

module.exports = { sendHeartbeat };
