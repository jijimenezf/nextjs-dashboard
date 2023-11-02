'use client';

import { useEffect } from "react";

export default function Error({ error, reset }: 
    { error: Error & { digest?: string }, reset: () => void}) {
        useEffect(() => {
            // Optionally log the error to an error report service
            console.log(error)
        }, [error]);

        return (
            <main className="flex h-full flex-col items-center justify-center">
                <h2 className="text-center">Something went wrong!</h2>
                <section className="text-sm text-red-500 bg-gray-400">{error.message}</section>
                <section className="text-sm text-red-500 bg-gray-400">{error?.digest}</section>
                <button
                  className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                  onClick={
                    // Attempt to recover by trying to re-render the invoices route
                    () => reset()
                  }
                >
                    Try again
                </button>
            </main>
        )
    }
