import { Pool } from 'pg'
import {
    CustomerField,
    CustomersTable,
    InvoiceForm,
    InvoicesTable,
    LatestInvoiceRaw,
    User,
    Revenue,
  } from './definitions';
import { formatCurrency } from './utils';
import { QueryResult } from 'pg';
import { unstable_noStore as noStore } from 'next/cache';

/** Postgress connection */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || '',
    ssl: true,
    max: 1, // set pool max size to 1, Free ElephantSQL databases accept only 1 connection
    idleTimeoutMillis: 3000, // close idle clients after 3 second5
    connectionTimeoutMillis: 6000, // return an error after 6 seconds if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times
})

const ITEMS_PER_PAGE = 6;

export async function fetchRevenue() {
    // Add noStore() here prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).
    noStore()

    try {
        console.log('Fetching revenue data...');
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const { rows }: QueryResult<Revenue> = await pool.query(`SELECT * FROM revenue`)
        
        return rows;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch revenue data.');
    }
}

export async function fetchLatestInvoices() {
    noStore()

    try {
        await new Promise((resolve) => setTimeout(resolve, 6000));
        const { rows }: QueryResult<LatestInvoiceRaw> = await pool.query(`
        SELECT invoices.amount, customers.name, customers.image_url, customers.email
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ORDER BY invoices.date DESC
        LIMIT 5`);

        const latestInvoices = rows.map((invoice) => ({
            ...invoice,
            amount: formatCurrency(invoice.amount),
        }))

        return latestInvoices;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the latest invoices.');
    }
}

export async function fetchCardData() {
    noStore()
    
    try {
        const invoiceCountPromise = pool.query(`SELECT COUNT(*) FROM invoices`);
        const customerCountPromise = pool.query(`SELECT COUNT(*) FROM customers`);
        const invoiceStatusPromise = pool.query(`SELECT
            SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
            FROM invoices`);

        const data = await Promise.all([
            invoiceCountPromise,
            customerCountPromise,
            invoiceStatusPromise,
        ]);
        
        const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
        const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
        const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
        const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
    
        return {
            numberOfCustomers,
            numberOfInvoices,
            totalPaidInvoices,
            totalPendingInvoices,
        };

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the card data.');
    }
}

export async function fetchFilteredInvoices(query: string, currentPage: number) {
    noStore()

    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    try {
        const { rows }: QueryResult<InvoicesTable> = await pool.query(`
          SELECT
            invoices.id,
            invoices.amount,
            invoices.date,
            invoices.status,
            customers.name,
            customers.email,
            customers.image_url
          FROM invoices
          JOIN customers on invoices.customer_id = customers.id
          WHERE
            customers.name ILIKE '%${query}%' OR
            customers.email ILIKE '%${query}%' OR
            invoices.amount::text ILIKE '%${query}%' OR
            invoices.date::text ILIKE '%${query}%' OR
            invoices.status ILIKE '%${query}%'
          ORDER BY invoices.date DESC
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`);
        
        return rows
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchInvoicesPages(query: string) {
    noStore()

    try {
        const { rows } = await pool.query(`
        SELECT COUNT(*)
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          customers.name ILIKE '%${query}%' OR
          customers.email ILIKE '%${query}%' OR
          invoices.amount::text ILIKE '%${query}%' OR
          invoices.date::text ILIKE '%${query}%' OR
          invoices.status ILIKE '%${query}%'
      `)
        
        const totalPages = Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE)
        return totalPages
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchCustomers() {
    noStore()

    try {
        const { rows }: QueryResult<CustomerField> = await pool.query(`
          SELECT id, name
          FROM customers
          ORDER BY name ASC`)

        return rows
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all customers.');
    }
}

export async function insertInvoice({
    customerId, amountInCents, status, created
}: { customerId: string; amountInCents: number; status: string; created: string }) {
    noStore()

    try {
        await pool.query(`INSERT INTO invoices(customer_id, amount, status, date)
        VALUES ($1, $2, $3, $4)`, [customerId, amountInCents, status, created]);
        return true;
    } catch (err) {
        console.error('Database Error:', err);
        return false;
    }
}

export async function fetchInvoiceById(id: string) {
    noStore()

    try {
        const { rows }: QueryResult<InvoiceForm> = await pool.query(`
          SELECT
            invoices.id,
            invoices.customer_id,
            invoices.amount,
            invoices.status
          FROM invoices
          WHERE invoices.id = $1`, [id])
        const invoices: InvoiceForm[] = rows.map((invoice) => ({
            ...invoice,
            amount: invoice.amount / 100,
        }))
        return invoices[0]
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoice.');
    }
}

export async function updateInvoice({
    id, customerId, amountInCents, status
}: { id: string; customerId: string; amountInCents: number; status: string; }) {
    noStore()

    try {
        await pool.query(`UPDATE invoices
          SET customer_id = $1, amount = $2, status = $3
          WHERE id = $4`, [customerId, amountInCents, status, id])
          return true;
    } catch (err) {
        console.error('Database Error:', err);
        return false;
    }
}

export async function deleteInvoice(id: string) {
    noStore()

    try {
        await pool.query(`DELETE FROM invoices WHERE id = $1`, [id])
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to delete the selected invoice.');
    }
}

export async function getUser(email: string) {
    noStore()
    try {
        const { rows }: QueryResult<User> = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
        if (rows.length > 0) {
            return rows[0];
        }
        return undefined;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export async function fetchCustomerPagination() {
    noStore()

    try {
        const { rows } = await pool.query(`
        SELECT COUNT(*)
        FROM customers`)
        const totalPages = Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE)
        return totalPages
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of customers.');
    }
}

export async function getCustomerData(currentPage: number) {
    noStore()

    const offset = (currentPage - 1) * ITEMS_PER_PAGE
    try {
        const { rows }: QueryResult<CustomersTable> = await pool.query(`
        SELECT
          customers.id,
          customers.name,
          customers.email,
          customers.image_url,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "total_paid",
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "total_pending"
        FROM customers, invoices
        WHERE invoices.customer_id = customers.id
        GROUP BY customers.id
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`)

        const customers = rows.map((customerList) => ({
            ...customerList,
            total_invoices: Number(customerList.total_paid) - Number(customerList.total_pending),
        }))

        return customers;

    } catch (error) {
        console.error('Failed to get customer data:', error);
        throw new Error('Failed to get customer data.');
    }
}
