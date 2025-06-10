// frontend/src/pages/login.tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserClient } from '@supabase/ssr'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function LoginPage() {
  const [supabaseClient] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-4">
            MySpeakHelper Login
          </h1>
          <Auth
            supabaseClient={supabaseClient}
            providers={['google','github']}
            appearance={{ theme: ThemeSupa }}
            socialLayout="horizontal"
          />
        </div>
      </div>
    </SessionContextProvider>
  )
}


