const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");


dotenv.config();
const app = express();
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;


const fibonacci = (n) => {
  if (!Number.isInteger(n) || n < 0) throw "Invalid Fibonacci input";
  const res = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++)
    if (n % i === 0) return false;
  return true;
};

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const hcf = (arr) => arr.reduce((a, b) => gcd(a, b));
const lcm = (arr) =>
  arr.reduce((a, b) => (a * b) / gcd(a, b));


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1)
      return res.status(400).json({ is_success: false });

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacci(body[key]);
        break;

      case "prime":
        if (!Array.isArray(body[key])) throw "Invalid prime input";
        data = body[key].filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body[key])) throw "Invalid lcm input";
        data = lcm(body[key]);
        break;

      case "hcf":
        if (!Array.isArray(body[key])) throw "Invalid hcf input";
        data = hcf(body[key]);
        break;

      case "AI":
        if (typeof body[key] !== "string") throw "Invalid AI input";

        let aiText = "";

        try {
          const aiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: [
                {
                  parts: [
                    {
                      text: `Reply with ONLY ONE WORD. No explanation. ${body[key]}`
                    }
                  ]
                }
              ]
            }
          );

          aiText =
            aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (err) {
          aiText = "";
        }

        data = aiText
          .trim()
          .split(/\s+/)[0]
          .replace(/[^a-zA-Z]/g, "") || "Unknown";

        break;


      default:
        return res.status(400).json({ is_success: false });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    res.status(400).json({
      is_success: false
    });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
