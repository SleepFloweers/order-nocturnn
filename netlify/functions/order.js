const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");
const GCP_CLIENT_EMAIL = "test-vabget-ini@nocturn-noir.iam.gserviceaccount.com";

const GCP_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvj2uy/sb9iLIL
ME9Iwtmt8DWW0s8EN8kQ2w/61MiyoU66BPojL65fmnM5xSLQ/+IIEfPruWE5GlBw
b5dDdDKGO63mSHPyvrLisypJkKGbuUI6wV0SF7wsxKo91z/jfUIs1VUqZ4sno2UL
51Q/e2da2tJ82zdtUK54uY1fNpjql0VMkVB7uuWabZ1q/blFPIBG+YQPJRLvP7PN
jk7oX/ERrcRHX7B3O21wAkqKihYwhlowFWbCEzZpbXyAuGdP77WhNRI/hw0DAJnr
IDpELWboRyIvpe9pGujd2NMhQI+QbJUM0nitf7OkYD3dEdhsbxsnJBcU5SYH0hUR
99w6sJYRAgMBAAECggEAFW6EPss0fqHv3kbM/vxud3nyCNH+XKz0uj6L4lqUj536
juHpqV76QgiIVX6X4/zA2qxaYyXz1PU96aPtytnGCzYA4jJpGTKngt5NZMKnv+tr
RuHxGzLTkYGGqNr8nShe6js21ODkD3g2bzATzFYjxWceOAjI6OrnCazZMczn+Qc/
Ud2hvrCdsT9/VaP/RMdd99mXjL5qgicJg4MnywYYHySGKkUCZJW3k1VPuSnZdFYF
THh5i+Yzix+yWWswP01L8lEGZJRnsEOz9OIxtGx5jD76FW9ZuoqG7y44temuM2op
Br67KTqFM2a6XkHP53Xf6rbeqaPeaV0xoN+Q2QNZIQKBgQDv5PxYnY5/Yk/igQ+s
3P1AQCsAa/hUIZCL6OXPHjTJwXZ5ZFVfNuaz6txAwlnSqwc8LG1TCmubbZGSJM3m
qg081FxuZDb+/ILodFJvfR1J2ywhYwrDQ+Bojklozelo82i1ZyfnPJnXN5L1RRo6
4Ravve3bMQRDZU/EbDjXLSqsqQKBgQC7WLyDpA2zc2LoPArJG0mcC7+bOaV/acj0
93/mYrTmelIY1SXIUBYhp+8coS4+fenwMYRVr3B1bHv8f4tqSBz0zgf1WizdSXdd
1aQgvIeklnCqzrRA7nzdqIaSRVATXQ46E5ZQ/5I4dCnovnywn1XQz07soXtKPKPZ
Y4Uk77HXKQKBgHg4Tgnus3m9AAGn4f4kJTosriAg+6rVw0WKKpi4L4YoUMIW+P2l
WsoxWb2OaEs98HtEXGkwIKscpsYRcao18DpaxhOAX1s7mjL6EFHU5nebwardoogm
nPBo1fsSrfUtfnziPEoSwZnsPNZzkeiN4ruht/CPyO4peGccQQP8m5U5AoGBAK+5
MMEM/KjoPspznu45ARcz0dnn/TqAX7Sd/UJ8LQ/Nhfmy24iCze9tlBM3f6ev9OCN
oYG5V/Nb+QPCImNjFn3sTnysw04gXa0O+a6XB2eykCU2Us5go5BJRUgnaU9wRirl
OmXpAh6fnrunCE+mdBiyimXbpUfhjxIVjcoyZY3ZAoGAdwO6Y9NguMkQ7+NITNOE
GyExbRE0eyR4bT9sAmqFEER3Y1qG17BccHpcLlHkDeSHVweUDylkqt3EGzQHioL2
lAqi6OsmZq3JCqITX+7KpLMkZIjvkpPi12Rg+8/TomlH2wuvhG+Ssb1CvC/2agDa
jeN8S2QLPykxmpOHMqWaE8A=
-----END PRIVATE KEY-----
`;
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
    private_key: GCP_PRIVATE_KEY.replace(/\
/g, "
"),
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