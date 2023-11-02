'use server';
import { z } from "zod";
import { insertInvoice, updateInvoice, deleteInvoice } from "./data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const InvoiceSchema =z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ date: true });

export async function createInvoice(formData: FormData) {
    try { /** redirect is not working under try-catch*/
        const { customerId, amount, status } = CreateInvoice.parse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });
        const amountInCents = amount * 100;
        const created = new Date().toISOString().split('T')[0];
        await insertInvoice({ customerId, amountInCents, status, created })
    } catch (err) {
        console.error('Error during creating invoice:', err);
        throw new Error('Check data submitted for the invoice');
    }
    // redirect works by throwing an error. To avoid this, you can call redirect after try/catch
    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function upToDateInvoice(id: string, formData: FormData) {
    try {
        const { customerId, amount, status } = UpdateInvoice.parse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
            id,
        });
        const amountInCents = amount * 100;
    
        await updateInvoice({id, customerId, amountInCents, status})
    } catch (err) {
        console.error('Error during updating invoice:', err);
        throw new Error('Check data submitted for the invoice');
    }

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function removeInvoice(id: string) {
    await deleteInvoice(id)
    revalidatePath('/dashboard/invoices')
}
