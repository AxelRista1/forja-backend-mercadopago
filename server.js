const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

/* ================= MERCADO PAGO ================= */
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend Mercado Pago activo 🚀" });
});

/* ================= CREAR PREFERENCIA ================= */
app.post("/crear-preferencia", async (req, res) => {
  try {
    const { titulo, precio } = req.body;

    if (!precio || isNaN(precio)) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    const result = await preference.create({
      body: {
        items: [
          {
            title: titulo || "Rutina de entrenamiento",
            quantity: 1,
            unit_price: Number(precio),
            currency_id: "ARS"
          }
        ],
        back_urls: {
          success: "https://forjatraining.com/success.html",
          failure: "https://forjatraining.com/failure.html",
          pending: "https://forjatraining.com/pending.html"
        },
        auto_return: "approved"
      }
    });

    res.json({
      init_point: result.init_point
    });

  } catch (error) {
    console.error("Error Mercado Pago:", error);
    res.status(500).json({ error: "Error Mercado Pago" });
  }
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});