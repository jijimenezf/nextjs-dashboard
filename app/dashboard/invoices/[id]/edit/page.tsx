import EditInvoiceForm from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";

export default async function Page({ params: { id } }: { params: { id: string }}) {
    const customers = await fetchCustomers()
    const invoice = await fetchInvoiceById(id)

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
