'use server';
import { z } from "zod";
import { insertInvoice, updateInvoice, deleteInvoice } from "./data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

const InvoiceSchema =z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce.number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ date: true });

// This is temporary until @types/react-dom is updated
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    },
    message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.'
        }
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const created = new Date().toISOString().split('T')[0];
    const isCreated = await insertInvoice({ customerId, amountInCents, status, created })

    if (!isCreated) {
        return {
            message: 'Databese error: Failed to create Invoice.'
        }
    }

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function upToDateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        id,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.'
        }
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    const isUpdated = await updateInvoice({id, customerId, amountInCents, status})
    if (!isUpdated) {
        return {
            message: 'Databese error: Failed to update Invoice.'
        }
    }

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

export async function removeInvoice(id: string) {
    await deleteInvoice(id)
    revalidatePath('/dashboard/invoices')
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', Object.fromEntries(formData));
    } catch(err) {
        if((err as Error).message.includes('CredentialsSignin')) {
            return 'CredentialsSignin';
        }
        throw err;
    }
}
