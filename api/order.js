import axios from "axios";
import { google } from "googleapis";

const GCP_CLIENT_EMAIL = "test-2@nocturn-noir.iam.gserviceaccount.com";

const GCP_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUgZ392GmKvxD1
2JGWLtAelzd8+a/Ek0TpyaTUGUqT8iQOOm4C3XPtrJTo998ea6/eKM2LoL6IjMJ2
9Ro2d0lIwa50pXUoUK5wyveCJorPPEeUiZpmCtq/6+rlDRk6goRM2lyBkvJs+Qgi
VSA6nx74/KQB32JMNflU6qql28kg0iQ2hWQv2Zbx3h4lEmwObKp3LgUblKhZ9U+R
c2TPNHWxamb+UjcjRqG+DT2c7OujVz/XlkEMDi8QoDBE6yPRKGFQbm9e68xwfSFU
fLiY1srK4iFmP5lVSsvypS15gkiMNe8FJpAxDFRjLauGqRKDbFyOMfriTFO0jnT0
gH1MOfVJAgMBAAECggEAPgN5TJu76P5q/6NskOwmVdcBHVpr/ayQXr02eaLLzbLK
7NAGTJW9f+1uIzI6jVEVqHo1yXpmP8j78uUB+kUDQNUsiOPD9bjdvxKr+fIvbdyE
cwdY5FBkl79L8/3Hj/iIjTjn5/QvBLgDtKks146Z5kUrw1QiBmV11l8I34/s+MNx
xsmJefoXWg39PFHrU6S2q+1fSy7I/pM3rr9UA08gTL13vzBn5OWKxuFi4UjsTs/d
5vkuXmHkgmMDcufu2QS1rvDjHHvD6Vz6Dh6ZqNqAV/Mv+DoWNSUag6CJ0AyJlla6
Lpqap+NtBQRB6rNxrpNsGAQRLf8Ir064VwO4VS8WpQKBgQD7KotxsFLSBhPfgN40
89M1e22RoVFPvVu1gp1CC5IzK6b4hsS8u7MCACc3De+Z7bBcI5DNrmU43uRFjFpy
9VuDOV9hN7hQlvP6ZA1fJOHKqhGc4+ykc2XQJyEDKB25Blc1EXzoh8xa+SHsXe4w
22LvCQUXUewBqnILhjNi3OReNwKBgQDYmJn7cj2EyeEyeEHEJ2+K2NCQfXzqUqDT
mmvskhd/EUV+OfoMPKSkOGbManMNGTLMv774hLqosBLs9Rpuo/z3UDHDdNbgdFCv
mufL07cySpxXbyRGbKwjsA/I6pK7heta/WIvhMJ1YszxOM0iY5TUgNmB3Imej35H
YaM4wS6IfwKBgAH0XM1vr9VOks0EdbY3x4b9BOdDOBzEvnf1IkAnUuXvCweYFOPb
GhOD6Mo244xxGxQ8ep3/I26D3YblBrcqTaIByko5YsfNxOxH5wq8gL1RAX4VD/xf
oYUzKMCbiU+tSvRwxGYS2HZExgzO1lGvA2AU0+NQkeOZbfXE/5VfXq+VAoGAbCyS
wuUEWnxk70rmNawoZiTwzSkPKQxJbEU0X3t7Jqgel/MmsdPbunS8ypzjhwgtudqN
6xqHCtadLSEgqV9XaMDxiZeh9YnB/mIUIFVFqmVe/b/xUwbVViGJUKPu0p8Is3HX
Brp8UBofFt5yfRlU7GjJuLTHOpyZyda2qRK6RcsCgYBQrmIbgu5v7VRtt92/BGTc
ttS0JA5W5Khe3N8A5DqZ8ClqDiZ/Ae3VybCUOKYxdx3HWpnnf90cIUy8ggfTTD9S
Nb046rBTbeQLB3JcnZPuyn55JLoeF2xLZUvG6ePcuOmqx5NSael6TWaKonu4fcH6
FxJIFNtsuMu0w/yY3YrKpQ==
-----END PRIVATE KEY-----
`;


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
