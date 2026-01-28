const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");

/* =====================
   CONFIG
===================== */
const WEBHOOK_URL =
  "https://discord.com/api/webhooks/1466090959438876768/0y68MWxLQqABnMP3-eRD3CWhsrvwqDArgspJCNFVtEc80znRxYTFCKI3SEFAdZQUtQq4";

const SPREADSHEET_ID = "12fI4mHy1gHC-Gh_4O23f7QfMgGtF8P2RJRI0AK8zRic";

const PIC_MENTIONS = {
  Alexis: "<@794805864733081630>",
  Al: "<@1055528012436733992>",
  Nori: "<@642731178964549642>",
  Hori: "<@862358953593274398>"
};

/* =====================
   GOOGLE SHEETS SETUP
===================== */
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "serviceaccount.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
 
const sheets = google.sheets({ version: "v4", auth });
const fs = require("fs");

console.log(
  "Service Account exists:",
  fs.existsSync(path.join(__dirname, "serviceaccount.json"))
);

/* =====================
   HANDLER
===================== */
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { customer, pic, items, total } = JSON.parse(event.body || "{}");

    if (!customer || !pic || !items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Data order tidak lengkap" }),
      };
    }

    const picMention = PIC_MENTIONS[pic] || pic;

    /* =====================
       DISCORD EMBED
    ===================== */
    const fields = items.map((item) => ({
      name: item.name,
      value: `Qty: ${item.qty}\nHarga: $${item.price.toLocaleString()}\nSubtotal: $${(
        item.qty * item.price
      ).toLocaleString()}`,
      inline: false,
    }));

    const embed = {
      title: "🛒 ORDER BARU MASUK",
      color: 0x3b82f6,
      fields: [
        { name: "👤 Customer", value: `**${customer}**`, inline: true },
        { name: "🧑‍💼 PIC", value: picMention, inline: true },
        { name: "📦 Detail Pesanan", value: " ", inline: false },
        ...fields,
        { name: "💰 TOTAL", value: `**$${total.toLocaleString()}**`, inline: false },
      ],
    };

    await axios.post(WEBHOOK_URL, {
      username: "Order Bot",
      content: `🔔 ${picMention} ada order baru!`,
      embeds: [embed],
    });

    /* =====================
       SAVE TO GOOGLE SHEET
    ===================== */
    const timestamp = new Date().toISOString();

    const rows = items.map((item) => [
      timestamp,
      customer,
      pic,
      item.name,
      item.qty,
      item.price,
      item.qty * item.price,
      total,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Order berhasil dikirim & disimpan ke Google Spreadsheet",
      }),
    };
  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Terjadi kesalahan server" }),
    };
  }
};