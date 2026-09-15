const express = require("express");
const cors = require("cors");
const path = require("path");
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

/* ================= SERVIR PDFs ================= */
app.use("/pdf", express.static(path.join(__dirname, "pdf")));

/* ================= DESCARGA FORZADA ================= */
app.get("/descargar/:file", (req, res) => {
  const filePath = path.join(__dirname, "pdf", req.params.file);

  res.download(filePath, err => {
    if (err) {
      console.error("Error descarga:", err);
      res.status(404).send("Archivo no encontrado");
    }
  });
});

/* ================= MERCADO PAGO ================= */
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Backend Mercado Pago activo 🚀" });
});

/* ================= CREAR PREFERENCIA (VERSIÓN ANTERIOR) ================= */
app.post("/crear-preferencia", async (req, res) => {
  try {
    const { titulo, precio, rutina } = req.body;

    if (!precio || isNaN(precio)) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    if (!rutina) {
      return res.status(400).json({ error: "Rutina no especificada" });
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

        // 🔥 VOLVEMOS A PASAR LA RUTINA POR URL
        back_urls: {
          success: `https://forjatraining.com/SUCCESS.HTM?rutina=${encodeURIComponent(rutina)}`,
          failure: "https://forjatraining.com/failure.html",
          pending: "https://forjatraining.com/pending.html"
        },

        auto_return: "approved"
      }
    });

    res.json({ init_point: result.init_point });

  } catch (error) {
    console.error("Error Mercado Pago:", error);
    res.status(500).json({ error: "Error Mercado Pago" });
  }
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});

  






/* =========================================================
   CREAR PREFERENCIA — DONACIÓN CUIDEMOS LO NUESTRO
========================================================= */

app.post("/crear-preferencia-donacion", async (req, res) => {

  try {

    const { precio } = req.body;

    /* ================= VALIDAR MONTO ================= */

    if (!precio || isNaN(precio)) {

      return res.status(400).json({
        error: "Monto de donación inválido"
      });

    }

    const monto = Number(precio);

    if (monto < 10) {

      return res.status(400).json({
        error: "El monto mínimo de donación es de $10"
      });

    }


    /* ================= CREAR PREFERENCIA ================= */

    const result = await preference.create({

      body: {

        items: [

          {
            title: "Donación - Cuidemos lo Nuestro",
            quantity: 1,
            unit_price: monto,
            currency_id: "ARS"
          }

        ],

        /* ================= URLS DE RETORNO ================= */

        back_urls: {

          success:
            "https://pf-axelrista.netlify.app/donacion-exitosa.html",

          failure:
            "https://pf-axelrista.netlify.app/donacion-error.html",

          pending:
            "https://pf-axelrista.netlify.app/donacion-pendiente.html"

        },

        auto_return: "approved"

      }

    });


    /* ================= RESPUESTA ================= */

    res.json({

      init_point: result.init_point

    });


  } catch (error) {

    console.error(
      "Error Mercado Pago - Donación:",
      error
    );

    res.status(500).json({

      error: "Error al crear la donación"

    });

  }

});