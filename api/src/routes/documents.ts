import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import type { Bindings } from '../types';

interface DocumentRow {
  id: string;
  user_id: string;
  doc_type: string;
  ref_no: string | null;
  title: string | null;
  client_name: string | null;
  doc_date: string | null;
  total_amount: number;
  currency: string;
  status: 'draft' | 'final';
  data_json: string;
  variant: string;
  created_at: number;
  updated_at: number;
}

const documents = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

documents.use('*', authMiddleware);

// GET /documents - list user's documents
documents.get('/', async (c) => {
  const userId = c.get('userId');
  const type = c.req.query('type');
  const status = c.req.query('status');
  const q = c.req.query('q')?.trim().toLowerCase();
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50', 10)));
  const offset = Math.max(0, parseInt(c.req.query('offset') || '0', 10));

  let whereClauses: string[] = ['user_id = ?'];
  let params: any[] = [userId];

  if (type && type !== 'all') {
    whereClauses.push('doc_type = ?');
    params.push(type);
  }

  if (status && status !== 'all') {
    whereClauses.push('status = ?');
    params.push(status);
  }

  if (q) {
    whereClauses.push('(lower(coalesce(title, "")) LIKE ? OR lower(coalesce(client_name, "")) LIKE ? OR lower(coalesce(ref_no, "")) LIKE ?)');
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereSql = whereClauses.join(' AND ');

  const countQuery = `SELECT COUNT(*) as count FROM documents WHERE ${whereSql}`;
  const totalRes = await c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = totalRes?.count || 0;

  const dataQuery = `
    SELECT id, user_id, doc_type, ref_no, title, client_name, doc_date, total_amount, currency, status, variant, created_at, updated_at
    FROM documents
    WHERE ${whereSql}
    ORDER BY updated_at DESC, created_at DESC
    LIMIT ? OFFSET ?
  `;
  const items = await c.env.DB.prepare(dataQuery).bind(...params, limit, offset).all<Omit<DocumentRow, 'data_json'>>();

  return c.json({
    items: items.results || [],
    total,
    limit,
    offset,
  });
});

// GET /documents/:id - get single document with full data
documents.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const doc = await c.env.DB
    .prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first<DocumentRow>();

  if (!doc) {
    return c.json({ error: 'Document not found' }, 404);
  }

  let data = {};
  try {
    data = JSON.parse(doc.data_json);
  } catch {}

  return c.json({
    ...doc,
    data,
  });
});

// POST /documents - create document
documents.post('/', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const docType = body.doc_type || 'agreement';
  const refNo = body.ref_no || null;
  const title = body.title || null;
  const clientName = body.client_name || null;
  const docDate = body.doc_date || new Date().toISOString().slice(0, 10);
  const totalAmount = Number(body.total_amount) || 0;
  const currency = body.currency || 'USD';
  const status = body.status === 'final' ? 'final' : 'draft';
  const variant = body.variant || 'classic';
  const dataJson = typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {});

  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  await c.env.DB.prepare(`
    INSERT INTO documents (
      id, user_id, doc_type, ref_no, title, client_name, doc_date,
      total_amount, currency, status, data_json, variant, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, userId, docType, refNo, title, clientName, docDate,
    totalAmount, currency, status, dataJson, variant, now, now
  ).run();

  return c.json({
    id,
    user_id: userId,
    doc_type: docType,
    ref_no: refNo,
    title,
    client_name: clientName,
    doc_date: docDate,
    total_amount: totalAmount,
    currency,
    status,
    variant,
    created_at: now,
    updated_at: now,
  }, 201);
});

// PUT /documents/:id - update document
documents.put('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const existing = await c.env.DB
    .prepare('SELECT id FROM documents WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first();

  if (!existing) {
    return c.json({ error: 'Document not found' }, 404);
  }

  const now = Math.floor(Date.now() / 1000);
  const refNo = body.ref_no !== undefined ? body.ref_no : null;
  const title = body.title !== undefined ? body.title : null;
  const clientName = body.client_name !== undefined ? body.client_name : null;
  const docDate = body.doc_date || null;
  const totalAmount = body.total_amount !== undefined ? Number(body.total_amount) || 0 : 0;
  const currency = body.currency || 'USD';
  const status = body.status === 'final' ? 'final' : 'draft';
  const variant = body.variant || 'classic';
  const dataJson = typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {});

  await c.env.DB.prepare(`
    UPDATE documents SET
      ref_no = ?,
      title = ?,
      client_name = ?,
      doc_date = ?,
      total_amount = ?,
      currency = ?,
      status = ?,
      data_json = ?,
      variant = ?,
      updated_at = ?
    WHERE id = ? AND user_id = ?
  `).bind(
    refNo, title, clientName, docDate,
    totalAmount, currency, status, dataJson, variant, now,
    id, userId
  ).run();

  return c.json({
    id,
    ref_no: refNo,
    title,
    client_name: clientName,
    doc_date: docDate,
    total_amount: totalAmount,
    currency,
    status,
    variant,
    updated_at: now,
  });
});

// DELETE /documents/:id - delete document
documents.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const res = await c.env.DB
    .prepare('DELETE FROM documents WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run();

  if (res.meta.changes === 0) {
    return c.json({ error: 'Document not found' }, 404);
  }

  return c.json({ ok: true });
});

// POST /documents/:id/duplicate - duplicate document as a new draft
documents.post('/:id/duplicate', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const doc = await c.env.DB
    .prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .first<DocumentRow>();

  if (!doc) {
    return c.json({ error: 'Document not found' }, 404);
  }

  const newId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const now = Math.floor(Date.now() / 1000);
  const duplicatedTitle = doc.title ? `${doc.title} (Copy)` : 'Copy';

  await c.env.DB.prepare(`
    INSERT INTO documents (
      id, user_id, doc_type, ref_no, title, client_name, doc_date,
      total_amount, currency, status, data_json, variant, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    newId, userId, doc.doc_type, doc.ref_no, duplicatedTitle, doc.client_name, doc.doc_date,
    doc.total_amount, doc.currency, 'draft', doc.data_json, doc.variant, now, now
  ).run();

  return c.json({
    id: newId,
    user_id: userId,
    doc_type: doc.doc_type,
    ref_no: doc.ref_no,
    title: duplicatedTitle,
    client_name: doc.client_name,
    doc_date: doc.doc_date,
    total_amount: doc.total_amount,
    currency: doc.currency,
    status: 'draft',
    variant: doc.variant,
    created_at: now,
    updated_at: now,
  }, 201);
});

export default documents;
