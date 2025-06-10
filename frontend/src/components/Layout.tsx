import Link from 'next/link'
import React, { ReactNode } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

type Props = {
    children: ReactNode
}

export default function Layout({ children }: Props) {

    const session = useSession()
    const supabase = useSupabaseClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }


    return (
        <div className='flex flex-col min-h-screen'>
            {/* HEADER */}
            <header className='bg-white shadow-md'>
                <div className='container mx-auto flex items-center justify-between p-4'>
                    <h1 className='text-xl font-bold'>MySpeakHelper</h1>
                    <nav className='space-x-4'>
                        <Link href="/" className='text-gray-700 hover:text-blue-600'>
                            Home
                        </Link>
                        <Link href="/email-check" className='text-gray-700 hover:text-blue-600'>
                            Email Check
                        </Link>
                        <Link href="/translate" className='text-gray-700 hover:text-blue-600'>
                            Translate
                        </Link>
                        <Link href="/generate-phrases" className='text-gray-700 hover:text-blue-600'>
                            Common Phrases
                        </Link>
                        <Link href="/speaking-practice" className='text-gray-700 hover:text-blue-600'>
                            Speaking Practice
                        </Link>
                        <Link href="/speech-to-text" className='text-gray-700 hover:text-blue-600'>
                            Speech-to-Text
                        </Link>
                        {/* Auth buttons */}
                        {session ? (
                            <button
                                onClick={handleLogout}
                                className='ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
                                type='button'
                            >
                                Log Out
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className='ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600'
                                type='button'
                            >
                                Log In
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className='flex-grow container mx-auto-4'>
                {children}
            </main>

            {/* FOOTER */}
            <footer className='bg-gray-100 text-center py-4 mt-8'>
                <p className='text-sm text-gray-600'>
                    © {new Date().getFullYear()} MySpeakHelper. All rights reserved.
                </p>
            </footer>
        </div>
    )
}