import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function LoginPage() {
    const supabase = useSupabaseClient()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    async function sendMagicLink(e: React.FormEvent) {
        e.preventDefault()
        setMessage('')
        if (!email) {
            setMessage('Please enter your email')
            return
        }
        const { error } = await supabase.auth.signInWithOtp({ email })
        setMessage(error ? `Error: ${error.message}` : 'Check your email for the link!')
    }

    async function signInWithProvider(provider: 'google' | 'facebook') {
        setMessage('')
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {

            },
        })
        if (error) setMessage(`Error: ${error.message}`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-4">Sign In</h1>

                {/* Magic-link form */}
                <form onSubmit={sendMagicLink} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border rounded p-3 focus:ring-2 focus:ring-blue-300"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Send Magic Link
                </button>
                </form>

                <div className="relative flex items-center">
                    <hr className="flex-grow border-gray-300" />
                    <span className="px-2 text-gray-500">or</span>
                    <hr className="flex-grow border-gray-300" />
                </div>

                {/* OAuth buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => signInWithProvider('google')}
                        className="w-full flex items-center justify-center border rounded p-2 hover:bg-gray-100"
                    >
                        <img src="/google-icon.svg" alt="Google" className="h-6 w-6 mr-2" />
                        Continue with Google
                    </button>    
                </div>
                {message && <p className="mt-3 text-gray-700">{message}</p>}
            </div>
        </div>
    )
}

