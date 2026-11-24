# ShopLedger – Smart Inventory & Accounting for Small Shops

A full-stack project: **HTML + CSS + JavaScript** website (frontend) and a **Node.js + Express** server (backend)
that saves data in a JSON file. Open it in VS Code and edit any file.

---

## Part 1 – Run it (step by step)

1. **Install Node.js** (version 18 or newer) from https://nodejs.org. Check it with `node -v` in a terminal.
2. **Open the project in VS Code**: File → Open Folder → choose the `shopledger` folder.
3. **Open the VS Code terminal**: Terminal → New Terminal.
4. **Install the dependency** (only Express):
   ```
   npm install
   ```
5. **Start the server**:
   ```
   npm start
   ```
   You should see: `ShopLedger running at http://localhost:3000`
6. **Open the app** in your browser: http://localhost:3000
7. **While editing**, use auto-restart mode for server files instead of step 5:
   ```
   npm run dev
   ```
   (Changes to files in `public/` only need a browser refresh.)
8. **Stop the server** with `Ctrl + C` in the terminal.

The first start creates `data/db.json` with a demo shop. Click "Clear sample data and start fresh" in the app
(or delete `data/db.json`) to begin with your own data.

---

## Part 2 – Folder map (what each file does)

```
shopledger/
├─ package.json            project info + scripts (npm start / npm run dev)
├─ server.js               STEP 1  starts Express, serves public/ and mounts the API routes
├─ data/
│  └─ db.json              created on first run – all shop data (products, sales, stock, expenses)
├─ src/                    BACKEND
│  ├─ db.js                STEP 2  reads/writes data/db.json
│  ├─ seed.js              STEP 3  demo data generator (edit the PRODUCTS list to change the demo shop)
│  ├─ utils.js             small helpers
│  └─ routes/              STEP 4  the API
│     ├─ state.js          GET /api/state, POST /api/admin/reset
│     ├─ products.js       add / edit / delete products
│     ├─ sales.js          record a sale (reduces stock) / void a sale (restores stock)
│     ├─ stock.js          stock in / stock out (+ optional purchase cost)
│     ├─ expenses.js       add / delete expenses
│     └─ settings.js       shop name + owner name
└─ public/                 FRONTEND (what the browser loads)
   ├─ index.html           STEP 6  page shell (sidebar, top bar, empty #view area)
   ├─ css/styles.css       STEP 5  all styling; colours are CSS variables at the top (light + dark mode)
   └─ js/
      ├─ app.js            STEP 13 start-up, page routing, all button clicks
      ├─ api.js            STEP 8  fetch() calls to the server
      ├─ state.js          STEP 9  holds the data + calculations (low stock, monthly totals…)
      ├─ utils.js          STEP 7  money / date formatting
      ├─ icons.js          STEP 7  SVG icons
      ├─ modal.js          STEP 10 pop-up windows, confirm boxes, toast messages
      ├─ forms.js          STEP 12 add product / record sale / record stock / add expense / settings forms
      └─ views/            STEP 11 one file per page
         ├─ shared.js      tiles, page header, empty state, "show more" button
         ├─ dashboard.js   tiles + weekly sales chart + low-stock alerts + recent transactions
         ├─ products.js    product table with search and filters
         ├─ stock.js       stock movements
         ├─ sales.js       sales list (click a row to see items or void)
         ├─ expenses.js    expense list
         └─ reports.js     monthly summary, top sellers, expenses by category
```

### How one action flows through the code (example: "Record sale")
1. You click **Record sale** → `app.js` calls `saleModal()` in `forms.js`.
2. You fill the form and press **Save sale** → `forms.js` sends it with `api.addSale()` (`api.js`).
3. The server route `src/routes/sales.js` checks stock, saves the sale, lowers stock, logs stock-out movements, and writes `data/db.json`.
4. `forms.js` then calls `refresh()` (`state.js`) which reloads the data and redraws the page.

---

## Part 3 – Common changes

| I want to… | Edit |
|---|---|
| Change colours / fonts | `public/css/styles.css` (variables at the top) |
| Change the demo products | `src/seed.js` → `PRODUCTS` |
| Add a field to products (e.g. brand) | `src/routes/products.js` (`clean`), `public/js/forms.js` (`prodForm`), `public/js/views/products.js` (table) |
| Add payment types (e.g. Credit) | `src/routes/sales.js` (allowed list) and `public/js/forms.js` (`<select id="f-pay">`) |
| Change the port | `PORT=4000 npm start` (Windows PowerShell: `$env:PORT=4000; npm start`) |
| Add a new page | add it to `ROUTES` and `VIEWS` in `public/js/app.js`, create `public/js/views/<name>.js` |
| Change the currency symbol | `inr()` in `public/js/utils.js` |
| Back up the data | copy `data/db.json` |
| Start over | stop the server, delete `data/db.json`, start again |

## Part 4 – API reference

| Method + URL | Purpose |
|---|---|
| `GET /api/state` | whole shop (products, sales, stock moves, expenses, settings) |
| `POST /api/products` · `PUT /api/products/:id` · `DELETE /api/products/:id` | manage products |
| `POST /api/sales` `{items:[{pid,qty,price}], payment}` | record a sale |
| `POST /api/sales/:id/void` | void a sale, return items to stock |
| `POST /api/stock` `{pid,type,qty,cost?,note?}` | stock in / out |
| `POST /api/expenses` · `DELETE /api/expenses/:id` | manage expenses |
| `PUT /api/settings` `{shop,owner}` | shop + owner name |
| `POST /api/admin/reset` `{mode:"sample"|"blank"}` | reload demo / erase all |

Business rules (e.g. "cannot sell more than in stock") are enforced on the server, so they apply no matter how the API is called.

## Part 5 – Troubleshooting

- **`npm` is not recognized** → install Node.js and reopen VS Code.
- **Page says "Could not reach the server"** → run `npm start` and open http://localhost:3000 (not the HTML file directly).
- **Port already in use** → another program uses 3000; run on another port (see Part 3).
- **Data looks wrong after editing `seed.js`** → delete `data/db.json` and restart.

## Part 6 – Ideas for next steps
- Replace `data/db.json` with SQLite or MongoDB (only `src/db.js` and the routes change).
- Add login (e.g. `express-session`) so each shop owner has their own account.
- Add barcode scanning, GST invoices, or a printable receipt page.

## Deploying online

The app is a normal Node.js server, so it runs on any Node host. It saves data to a JSON file, so the host **must keep a persistent disk**; on hosts with a temporary disk, the shop data is lost whenever the app restarts.

Render (included `render.yaml`):
1. Push this folder to GitHub (do not commit `node_modules/` or `data/`).
2. In Render choose New → Blueprint, pick the repo; it reads `render.yaml`.
3. Open the URL Render gives you (`https://shopledger-xxxx.onrender.com`).

Any other host: set start command `npm start`, and set the environment variable `DATA_DIR` to a folder on the persistent disk. The port comes from `PORT` automatically.
