import { Metadata } from "next";
import Image from "next/image";
import { formatCurrency } from "@/app/lib/utils";
import { getCustomerData, fetchCustomerPagination } from "@/app/lib/data";
import { CustomersTable } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { Suspense } from "react";
import Pagination from "@/app/ui/invoices/pagination";

export const metadata: Metadata = {
    title: 'Customers',
};


export default async function Page({ searchParams }: { searchParams?: { page?: string; }}) {
    const currentPage = Number(searchParams?.page) || 1
    const [totalPages, customers] = await Promise.all([
        fetchCustomerPagination(),
        getCustomerData(currentPage)
    ])

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
            </div>
            <Suspense key={`customer`+currentPage} fallback={<div />}>
                <CustomerTable customers={customers} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages}/>
            </div>
        </div>
      )
}

function CustomerTable ({ customers }: { customers: CustomersTable[]}) {
    return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {customers?.map((customer) => (
              <div
                key={customer.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={customer.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${customer.name}'s profile picture`}
                      />
                      <p>{customer.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Paid</span>
                    <p className="text-xl font-medium">
                      {formatCurrency(customer.total_paid)}
                    </p>
                    <span className="text-sm font-medium text-gray-500">Total Pending</span>
                    <p className="text-xl font-medium">
                      {formatCurrency(customer.total_pending)}
                    </p>
                    <span className="text-sm font-medium text-gray-500">Total Invoices</span>
                    <p className="text-xl font-medium">
                      {formatCurrency(customer.total_invoices)}
                    </p>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Paid
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Pending
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Invoices
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {customers?.map((customer) => (
                <tr
                  key={customer.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={customer.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${customer.name}'s profile picture`}
                      />
                      <p>{customer.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {customer.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(customer.total_paid)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(customer.total_pending)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(customer.total_invoices)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    )
}
