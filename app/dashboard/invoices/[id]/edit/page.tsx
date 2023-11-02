import EditInvoiceForm from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params: { id } }: { params: { id: string }}) {
    /* const customers = await fetchCustomers()
    const invoice = await fetchInvoiceById(id) */
    // This is the alternative in order to avoid waterfall request for fetching data
    const [customers, invoice] = await Promise.all([fetchCustomers(), fetchInvoiceById(id)]);

    if (!invoice) {
      notFound();
    }

    return (
        <main>
            <Breadcrumbs
              breadcrumbs={[
                { label: 'Invoices', href: '/dashboard/invoices' },
                { label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true },
              ]}
            />
            <EditInvoiceForm invoice={invoice} customers={customers} />
        </main>
    )
}
