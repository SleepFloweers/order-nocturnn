import axios from "axios";
import { google } from "googleapis";

const GCP_CLIENT_EMAIL = "test-2@nocturn-noir.iam.gserviceaccount.com";
const GCP_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
PASTE KEY ASLI DI SINI
-----END PRIVATE KEY-----`;

const WEBHOOK_URL = "https://discord.com/api/webhooks/1466090959438876768/0y68MWxLQqABnMP3-eRD3CWhsrvwqDArgspJCNFVtEc80znRxYTFCKI3SEFAdZQUtQq4";
const SPREADSHEET_ID = "12fI4mHy1gHC-Gh_4O23f7QfMgGtF8P2RJRI0AK8zRic";

const PIC_MENTIONS = {
  Alexis: "<@794805864733081630>",
  Al: "<@1055528012436733992>",
  Nori: "<@642731178964549642>",
  Hori: "<@862358953593274398>",
  Raven: "<@467190054784073728>",
  Arthur: "<@1321528042182410261>",
  Adi: "<@589731354472873984>",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { customer, pic, items, total } = req.body || {};

    if (!customer || !pic || !items?.length) {
      return res.status(400).json({ message: "Data order tidak lengkap" });
    }

    /* ===== GOOGLE AUTH ===== */
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GCP_CLIENT_EMAIL,
        private_key: GCP_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth });

    /* ===== DISCORD ===== */
    const picMention = PIC_MENTIONS[pic] || pic;

    await axios.post(
      WEBHOOK_URL,
      {
        content: `🔔 ${picMention} ada order baru!`,
      },
      { timeout: 5000 }
    );

    /* ===== GOOGLE SHEET ===== */
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
      requestBody: { values: rows },
    });

    return res.status(200).json({
      success: true,
      discord: "Y",
      spreadsheet: "Y",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      discord: "N",
      spreadsheet: "N",
      error: error.message,
    });
  }
}
