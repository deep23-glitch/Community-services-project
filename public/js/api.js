// STEP 8 - Talks to the Node server. Every function returns a Promise; errors carry the server's message.
async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  state: () => call('GET', '/api/state'),
  addProduct: (b) => call('POST', '/api/products', b),
  updateProduct: (id, b) => call('PUT', '/api/products/' + id, b),
  deleteProduct: (id) => call('DELETE', '/api/products/' + id),
  addSale: (b) => call('POST', '/api/sales', b),
  voidSale: (id) => call('POST', '/api/sales/' + id + '/void'),
  addStock: (b) => call('POST', '/api/stock', b),
  addExpense: (b) => call('POST', '/api/expenses', b),
  deleteExpense: (id) => call('DELETE', '/api/expenses/' + id),
  saveSettings: (b) => call('PUT', '/api/settings', b),
  reset: (mode) => call('POST', '/api/admin/reset', { mode }),
};
