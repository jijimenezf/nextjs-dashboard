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
    // try { /** redirect is not working under try-catch*/
        const { customerId, amount, status } = CreateInvoice.parse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });
        const amountInCents = amount * 100;
        const created = new Date().toISOString().split('T')[0];
        await insertInvoice({ customerId, amountInCents, status, created })

        revalidatePath('/dashboard/invoices')
        redirect('/dashboard/invoices')
    /*} catch (err) {
        console.error('Error during addin the invoice:', err);
        throw new Error('Check data submitted for the invoice');
    }*/
}

export async function upToDateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        id,
    });
    const amountInCents = amount * 100;

    await updateInvoice({id, customerId, amountInCents, status})

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function removeInvoice(id: string) {
    await deleteInvoice(id)
    revalidatePath('/dashboard/invoices')
}
