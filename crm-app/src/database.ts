import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function initDatabase() {
  try {
    // Initialize SQLite database
    db = await Database.load("sqlite:crm.db");

    // Create contacts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id)
      )
    `);

    // Create companies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        industry TEXT,
        website TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        company_id INTEGER,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id),
        FOREIGN KEY (company_id) REFERENCES companies (id)
      )
    `);

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

// Contact operations
export interface Contact {
  id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: number;
  created_at?: string;
  updated_at?: string;
}

export async function createContact(contact: Contact) {
  const db = getDatabase();
  const result = await db.execute(
    `INSERT INTO contacts (first_name, last_name, email, phone, company_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [contact.first_name, contact.last_name, contact.email || null, contact.phone || null, contact.company_id || null]
  );
  return result;
}

export async function getContacts(): Promise<Contact[]> {
  const db = getDatabase();
  const result = await db.select<Contact[]>(`SELECT * FROM contacts ORDER BY created_at DESC`);
  return result;
}

export async function updateContact(id: number, contact: Partial<Contact>) {
  const db = getDatabase();
  const fields = [];
  const values = [];

  if (contact.first_name !== undefined) {
    fields.push("first_name = ?");
    values.push(contact.first_name);
  }
  if (contact.last_name !== undefined) {
    fields.push("last_name = ?");
    values.push(contact.last_name);
  }
  if (contact.email !== undefined) {
    fields.push("email = ?");
    values.push(contact.email);
  }
  if (contact.phone !== undefined) {
    fields.push("phone = ?");
    values.push(contact.phone);
  }
  if (contact.company_id !== undefined) {
    fields.push("company_id = ?");
    values.push(contact.company_id);
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  await db.execute(
    `UPDATE contacts SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export async function deleteContact(id: number) {
  const db = getDatabase();
  await db.execute(`DELETE FROM contacts WHERE id = ?`, [id]);
  await db.execute(`DELETE FROM notes WHERE contact_id = ?`, [id]);
}

// Company operations
export interface Company {
  id?: number;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createCompany(company: Company) {
  const db = getDatabase();
  const result = await db.execute(
    `INSERT INTO companies (name, industry, website, phone) VALUES ($1, $2, $3, $4)`,
    [company.name, company.industry || null, company.website || null, company.phone || null]
  );
  return result;
}

export async function getCompanies(): Promise<Company[]> {
  const db = getDatabase();
  const result = await db.select<Company[]>(`SELECT * FROM companies ORDER BY created_at DESC`);
  return result;
}

export async function updateCompany(id: number, company: Partial<Company>) {
  const db = getDatabase();
  const fields = [];
  const values = [];

  if (company.name !== undefined) {
    fields.push("name = ?");
    values.push(company.name);
  }
  if (company.industry !== undefined) {
    fields.push("industry = ?");
    values.push(company.industry);
  }
  if (company.website !== undefined) {
    fields.push("website = ?");
    values.push(company.website);
  }
  if (company.phone !== undefined) {
    fields.push("phone = ?");
    values.push(company.phone);
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  await db.execute(
    `UPDATE companies SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export async function deleteCompany(id: number) {
  const db = getDatabase();
  await db.execute(`DELETE FROM companies WHERE id = ?`, [id]);
  await db.execute(`DELETE FROM notes WHERE company_id = ?`, [id]);
  await db.execute(`UPDATE contacts SET company_id = NULL WHERE company_id = ?`, [id]);
}

// Note operations
export interface Note {
  id?: number;
  contact_id?: number;
  company_id?: number;
  content: string;
  created_at?: string;
}

export async function createNote(note: Note) {
  const db = getDatabase();
  const result = await db.execute(
    `INSERT INTO notes (contact_id, company_id, content) VALUES ($1, $2, $3)`,
    [note.contact_id || null, note.company_id || null, note.content]
  );
  return result;
}

export async function getNotesByContact(contactId: number): Promise<Note[]> {
  const db = getDatabase();
  const result = await db.select<Note[]>(
    `SELECT * FROM notes WHERE contact_id = ? ORDER BY created_at DESC`,
    [contactId]
  );
  return result;
}

export async function getNotesByCompany(companyId: number): Promise<Note[]> {
  const db = getDatabase();
  const result = await db.select<Note[]>(
    `SELECT * FROM notes WHERE company_id = ? ORDER BY created_at DESC`,
    [companyId]
  );
  return result;
}

export async function deleteNote(id: number) {
  const db = getDatabase();
  await db.execute(`DELETE FROM notes WHERE id = ?`, [id]);
}
