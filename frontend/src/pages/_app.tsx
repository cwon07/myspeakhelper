import '../styles/globals.css'  
import type { AppProps } from 'next/app'
import { createBrowserClient } from '@supabase/ssr'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import Layout from '../components/Layout'
import { useState } from 'react'


export default function MyApp({ Component, pageProps }: AppProps) {
  
  const [supabaseClient] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  )

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={(pageProps as any).initialSession}
    >
      <Layout>
      <Component {...pageProps} />
    </Layout>
    </SessionContextProvider>    
  )
}