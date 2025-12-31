const express = require("express");
const cors = require("cors");
const path = require("path");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
const PORT = process.env.PORT || 10000;

/* =======================
   MIDDLEWARES
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   MERCADO PAGO PROD
======================= */
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);

/* =======================
   FRONTEND (SIN PUBLIC)
======================= */
app.use(express.static(__dirname));

/* =======================
   CREAR PREFERENCIA
======================= */
app.post("/crear-preferencia", async (req, res) => {
  try {
    const result = await preference.create({
      body: {
        items: [
          {
            title: "Plan de Entrenamiento FORJA",
            quantity: 1,
            currency_id: "ARS",
            unit_price: 1000,
          },
        ],
        back_urls: {
          success: "https://forjatraining.com/success.html",
          failure: "https://forjatraining.com/failure.html",
          pending: "https://forjatraining.com/pending.html",
        },
        auto_return: "approved",
      },
    });

    res.json({
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("Error Mercado Pago:", error);
    res.status(500).json({
      error: "Error al crear la preferencia",
      detalle: error.message,
    });
  }
});

/* =======================
   SPA FALLBACK
======================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});