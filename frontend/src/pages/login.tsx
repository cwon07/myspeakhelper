import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function LoginPage() {
    const supabase = useSupabaseClient()
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setMessage('')
        if (!email) {
            setMessage('Please enter a valid email')
            return
        }

        const {error} = await supabase.auth.signInWithOtp({email})
        if (error) {
            setMessage(`Error: ${error.message}`)
        } else {
            setMessage('Check your email for the login link.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <label className="block font-medium">Email:</label>
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
                {message && <p className="mt-3 text-gray-700">{message}</p>}
            </div>
        </div>
    )
}

