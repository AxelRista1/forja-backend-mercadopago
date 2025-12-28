const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(express.json());
app.use(express.static('public'));

/* Mercado Pago */
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

/* Health check */
app.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

/* Crear preferencia */
app.post('/crear-preferencia', async (req, res) => {
  const { rutina } = req.body;

  try {
    const result = await preference.create({
      body: {
        items: [{
          title: `Rutina ${rutina}`,
          quantity: 1,
          unit_price: 3500,
          currency_id: 'ARS'
        }],
        back_urls: {
          success: 'https://TU-DOMINIO/success.html',
          failure: 'https://TU-DOMINIO/failure.html',
          pending: 'https://TU-DOMINIO/pending.html'
        },
        auto_return: 'approved'
      }
    });

    res.json({ init_point: result.body.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error Mercado Pago' });
  }
});

/* Server */
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});