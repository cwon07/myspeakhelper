import { useState, FormEvent } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

async function improveEmail(email: string, tone: string) {
    const res = await fetch(`${API}/email-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email, tone }),
    })
    if (!res.ok) throw new Error(await res.text())
        return(await res.json()).improved_email as string
}

export default function EmailCheck() {
    const [email, setEmail] = useState('')
    const [tone, setTone] = useState('casual')
    const [result, setResult] = useState('')

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const improved = await improveEmail(email, tone)
        setResult(improved)
    }

    return(
        <form onSubmit={onSubmit} className='p-4 max-w-lg mx-auto'>
            <label className='block mb-1'>Your draft:</label>
            <textarea
                className='w-full h-32 border rounded p-2'
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <label className='block mt-4 mb-1'>Tone:</label>
            <select
                className='w-full border rounded p-2'
                value={tone}
                onChange={e => setTone(e.target.value)}
            >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
            </select>

            <button
                type='submit'
                className='mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
                Improve
            </button>

            {result && (
                <div className='mt-6 p-4 border rounded bg-gray-50'>
                    <h2 className='font-semibold mb-2'>Suggestions:</h2>
                    <pre className='whitespace-pre-wrap'>{result}</pre>
                </div>
            )}
        </form>
    )
}