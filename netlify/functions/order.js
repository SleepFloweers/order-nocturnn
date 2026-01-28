const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");
const GCP_CLIENT_EMAIL = "nocturn-noir@nocturn-noir.iam.gserviceaccount.com";

const GCP_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDo48D2wof/dBh2\nU7S9gJw2JRtnC7mz1CvPIfunBm92k0kijNdqtdNHq3QkYibhYAEWfeOerqIGMebf\nVBh/gOzZ5Yc3FFVtSP3c/jM2R6xuyZ1+Zey12ynthh46vf7sA6wswyQkjZ24ij4n\nPTOSS4WtH5wWMUXZEAlt2GoEWhsWkmOI7iusuNAaqoL0Bp/kueqx7ZiXoMYGeqay\naJeIDiGRFayIsUr1kvZVSCn5AU6EBvW3VGMX086PNj3ObM0kx/fm8P9cZ8UJPFQn\n5FldQp+dfj3VqZCtq+7hOcjswuCWteEmqnjL32vY2wv1+rwx5rWuBX+pE1NzpYZi\nzA2xhaU9AgMBAAECgf8Nfnov0hW54ireBaZIqgBjIsNJCo+NW+iDQp9842KR/EwV\n3xNG8OzND6IrJC9x354whMWA7Eghvm0iLj09JhCTOjlwzOd7mD8dZEfospPLLONz\nRMnyakCDrWxoUESfvZa8VpJBi/MXk5WxBbAh9JOfnwqW6UP4JSBmvPi88nufUxUi\n3o4HLN/rD3sHGY5REQAtvdhObQXWjFI2XxxABfpPZV8j7sZeMI5X13OVtXoirmpD\nhmuwZ6f7970dGp94Og9z8FTdPw97edayPj/qmODJX5qyqVQV6s78k/MPiBbrVeRb\nVq5c6zbo83HdGIzucPBjDSxARJLSB41A3EUFU2sCgYEA+vZja4zvLzn0teLdZ9eD\n5vELbF+PogwhGuuO/dypNb4jggxHXyGCv1oSMNBBn6+rc1xvmFThIQdiWd+wcDBp\nhIYx6vXgt3iYn2iaPWg9bZZqH1D3U/1R5YZFj2s9PHC5j8Ak1CW/tPSaQcKUzKKa\n+1YjmlaCcisUzW/99se1pjcCgYEA7ZB+0ydSf5+sCtNebUSgt50PyZgRNm8O41NY\nWEoqVj+NOx3+FKmHdbIw42sDpgKFyFYsZUSFKyED0UTdrDkepu20azcpbkr6NhcL\nwulIBgK81WB4QQ3ozpwxu2220wTDK5CQfqdGpbZAa5o/Jb12O9886Lsjul3MdMks\nnUcWFisCgYB7QiA6ZpHjJBfobXBI3DTQbHsr0xN8h3CLBD7KuGHzH1vZN6amNpM8\n4EQm7WINx/3xPukgbC/WRQYtFgxWTbDFghNqTzD7a6OqR3nZxyTEeifNEbsn6Tcc\nAAKSGh2NXeAFll2ARLoPakOJIMRsbUCpSPlbiDmxUS96ZxLY7eVtqQKBgQCEhqc5\nhCYxrBF9uIxkyHQf+i5kd8CibTIQ/t254yXbF3jiEck8HZbDwbQkKf7PDXk0WV5K\n3/6qILDQfWpsOTEwTkrnxM4ICSusIQ8enKThNYXCQx7Sq7/EAr57oKjs7ysxkmQJ\nQ6fVqeYmINY5Z4gdvltsOXmk7c6xF8kbtBxOIQKBgFmJMsWp9RXw1DRseTg/p5y5\nTJFdeBMtWSmOnEjVOG2TqvSi90a1uG26aw/HaFw5kUEikxCnc6XGg6f+bAvwq3/m\n4Kvf6QjsqHeZnPJjUikgknfGcTVDft+JOP4z+fLNFR724tBG1hQIF4b2n7zcog0P\nKATJ5CBpFt6WXPqGSx0w\n-----END PRIVATE KEY-----\n`;
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