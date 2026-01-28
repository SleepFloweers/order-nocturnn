const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const WEBHOOK_URL =
  "https://discord.com/api/webhooks/1466090959438876768/0y68MWxLQqABnMP3-eRD3CWhsrvwqDArgspJCNFVtEc80znRxYTFCKI3SEFAdZQUtQq4";

const PIC_MENTIONS = {
  Alexis: "<@794805864733081630>",
  Al: "<@1055528012436733992>",
  Nori: "<@642731178964549642>",
  Hori: "<@862358953593274398>"
};

/**
 * ROUTE TEST (CEK SERVER)
 */
app.get("/order", (req, res) => {
  res.json({ message: "Order endpoint OK (gunakan POST)" });
});

/**
 * ROUTE ORDER
 */
app.post("/order", async (req, res) => {
  console.log("Order masuk:", req.body);

  const { customer, pic, items, total } = req.body;

  if (!customer || !pic || !items || items.length === 0) {
    return res.status(400).json({
      message: "Data order tidak lengkap"
    });
  }

  const picMention = PIC_MENTIONS[pic] || pic;

  const fields = items.map(item => ({
    name: item.name,
    value:
      `Qty: ${item.qty}\n` +
      `Harga: Rp${item.price.toLocaleString()}\n` +
      `Subtotal: Rp${(item.qty * item.price).toLocaleString()}`,
    inline: false
  }));

  const embed = {
    title: "🛒 ORDER BARU MASUK",
    color: 0x3b82f6,
    fields: [
      {
        name: "👤 Customer",
        value: `**${customer}**`,
        inline: true
      },
      {
        name: "🧑‍💼 PIC",
        value: picMention,
        inline: true
      },
      {
        name: "📦 Detail Pesanan",
        value: " ",
        inline: false
      },
      ...fields,
      {
        name: "💰 TOTAL",
        value: `**Rp${total.toLocaleString()}**`,
        inline: false
      }
    ],
    footer: { text: "Order System • Web" },
    timestamp: new Date()
  };

  try {
    await axios.post(WEBHOOK_URL, {
      username: "Order Bot",
      content: `🔔 ${picMention} ada order baru!`,
      embeds: [embed]
    });

    res.status(200).json({
      message: "Order berhasil dikirim ke Discord"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengirim order"
    });
  }
});

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});
