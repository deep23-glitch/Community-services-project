// STEP 1 - Entry point. Creates the Express app, serves the website (public/) and mounts the API (/api/...).
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stateRoutes from './src/routes/state.js';
import productRoutes from './src/routes/products.js';
import saleRoutes from './src/routes/sales.js';
import stockRoutes from './src/routes/stock.js';
import expenseRoutes from './src/routes/expenses.js';
import settingsRoutes from './src/routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());                                   // read JSON request bodies
app.use(express.static(path.join(__dirname, 'public')));   // serve index.html, css, js

app.use('/api', stateRoutes);                // GET /api/state, POST /api/admin/reset
app.use('/api/products', productRoutes);     // add / edit / delete products
app.use('/api/sales', saleRoutes);           // record / void sales
app.use('/api/stock', stockRoutes);          // stock in / out
app.use('/api/expenses', expenseRoutes);     // add / delete expenses
app.use('/api/settings', settingsRoutes);    // shop + owner name

// Unknown API route -> JSON error (instead of an HTML page)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Any unexpected error -> JSON error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => console.log(`ShopLedger running at http://localhost:${PORT}`));
