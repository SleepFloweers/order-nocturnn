const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");
const GCP_CLIENT_EMAIL = "test-2@nocturn-noir.iam.gserviceaccount.com";

const GCP_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUgZ392GmKvxD1\n2JGWLtAelzd8+a/Ek0TpyaTUGUqT8iQOOm4C3XPtrJTo998ea6/eKM2LoL6IjMJ2\n9Ro2d0lIwa50pXUoUK5wyveCJorPPEeUiZpmCtq/6+rlDRk6goRM2lyBkvJs+Qgi\nVSA6nx74/KQB32JMNflU6qql28kg0iQ2hWQv2Zbx3h4lEmwObKp3LgUblKhZ9U+R\nc2TPNHWxamb+UjcjRqG+DT2c7OujVz/XlkEMDi8QoDBE6yPRKGFQbm9e68xwfSFU\nfLiY1srK4iFmP5lVSsvypS15gkiMNe8FJpAxDFRjLauGqRKDbFyOMfriTFO0jnT0\ngH1MOfVJAgMBAAECggEAPgN5TJu76P5q/6NskOwmVdcBHVpr/ayQXr02eaLLzbLK\n7NAGTJW9f+1uIzI6jVEVqHo1yXpmP8j78uUB+kUDQNUsiOPD9bjdvxKr+fIvbdyE\ncwdY5FBkl79L8/3Hj/iIjTjn5/QvBLgDtKks146Z5kUrw1QiBmV11l8I34/s+MNx\nxsmJefoXWg39PFHrU6S2q+1fSy7I/pM3rr9UA08gTL13vzBn5OWKxuFi4UjsTs/d\n5vkuXmHkgmMDcufu2QS1rvDjHHvD6Vz6Dh6ZqNqAV/Mv+DoWNSUag6CJ0AyJlla6\nLpqap+NtBQRB6rNxrpNsGAQRLf8Ir064VwO4VS8WpQKBgQD7KotxsFLSBhPfgN40\n89M1e22RoVFPvVu1gp1CC5IzK6b4hsS8u7MCACc3De+Z7bBcI5DNrmU43uRFjFpy\n9VuDOV9hN7hQlvP6ZA1fJOHKqhGc4+ykc2XQJyEDKB25Blc1EXzoh8xa+SHsXe4w\n22LvCQUXUewBqnILhjNi3OReNwKBgQDYmJn7cj2EyeEyeEHEJ2+K2NCQfXzqUqDT\nmmvskhd/EUV+OfoMPKSkOGbManMNGTLMv774hLqosBLs9Rpuo/z3UDHDdNbgdFCv\nmufL07cySpxXbyRGbKwjsA/I6pK7heta/WIvhMJ1YszxOM0iY5TUgNmB3Imej35H\nYaM4wS6IfwKBgAH0XM1vr9VOks0EdbY3x4b9BOdDOBzEvnf1IkAnUuXvCweYFOPb\nGhOD6Mo244xxGxQ8ep3/I26D3YblBrcqTaIByko5YsfNxOxH5wq8gL1RAX4VD/xf\noYUzKMCbiU+tSvRwxGYS2HZExgzO1lGvA2AU0+NQkeOZbfXE/5VfXq+VAoGAbCyS\nwuUEWnxk70rmNawoZiTwzSkPKQxJbEU0X3t7Jqgel/MmsdPbunS8ypzjhwgtudqN\n6xqHCtadLSEgqV9XaMDxiZeh9YnB/mIUIFVFqmVe/b/xUwbVViGJUKPu0p8Is3HX\nBrp8UBofFt5yfRlU7GjJuLTHOpyZyda2qRK6RcsCgYBQrmIbgu5v7VRtt92/BGTc\nttS0JA5W5Khe3N8A5DqZ8ClqDiZ/Ae3VybCUOKYxdx3HWpnnf90cIUy8ggfTTD9S\nNb046rBTbeQLB3JcnZPuyn55JLoeF2xLZUvG6ePcuOmqx5NSael6TWaKonu4fcH6\nFxJIFNtsuMu0w/yY3YrKpQ==\n-----END PRIVATE KEY-----\n`;
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
  Hori: "<@862358953593274398>",
  Nori: "<@642731178964549642>",
  Raven: "<@467190054784073728>",
  Arthur: "<@1321528042182410261>",
  Adi: "<@589731354472873984>"
};


const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GCP_CLIENT_EMAIL,
    private_key: GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

 
const sheets = google.sheets({ version: "v4", auth });


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
      value: `Qty: ${item.qty}
Harga: $${item.price.toLocaleString()}
Subtotal: $${(
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
  }catch (error) {
    console.error("ERROR FULL:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Terjadi kesalahan server",
        error: error.message,
      }),
    };
  }
};