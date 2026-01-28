
const axios = require("axios");

const WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL";

const PIC_MENTIONS = {
  Alexis: "<@794805864733081630>",
  Al: "<@1055528012436733992>",
  Nori: "<@642731178964549642>",
  Hori: "<@862358953593274398>"
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { customer, pic, items, total } = JSON.parse(event.body || "{}");

  if (!customer || !pic || !items || items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Data order tidak lengkap" })
    };
  }

  const picMention = PIC_MENTIONS[pic] || pic;

  const fields = items.map(item => ({
    name: item.name,
    value: `Qty: ${item.qty}\nHarga: Rp${item.price.toLocaleString()}\nSubtotal: Rp${(item.qty * item.price).toLocaleString()}`,
    inline: false
  }));

  const embed = {
    title: "🛒 ORDER BARU MASUK",
    color: 0x3b82f6,
    fields: [
      { name: "👤 Customer", value: `**${customer}**`, inline: true },
      { name: "🧑‍💼 PIC", value: picMention, inline: true },
      { name: "📦 Detail Pesanan", value: " ", inline: false },
      ...fields,
      { name: "💰 TOTAL", value: `**Rp${total.toLocaleString()}**`, inline: false }
    ]
  };

  await axios.post(WEBHOOK_URL, {
    username: "Order Bot",
    content: `🔔 ${picMention} ada order baru!`,
    embeds: [embed]
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Order berhasil dikirim" })
  };
};
