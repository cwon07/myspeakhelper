import { useState, FormEvent } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

async function translateText(text: string, target: string) {
    const res = await fetch(`${API}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ text, target_language: target }),
    })
    if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        return json.translation as string
}

export default function TranslatePage() {
    const [text, setText] = useState('')
    const [target, setTarget] = useState('en')
    const [result, setResult] = useState('')

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const translation = await translateText(text, target)
        setResult(translation)
    }

    return(
        <form onSubmit={onSubmit} className='p-4 max-w-lg mx-auto'>
            <label className='block mb-1'>Original text:</label>
            <textarea
                className='w-full h-32 border rounded p-2'
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <label className='block mt-4 mb-1'>Target language:</label>
            <select
                className='w-full-border rounded p-2'
                value={target}
                onChange={e => setTarget(e.target.value)}
            >
                <option value="en">English</option>
                <option value="ko">Korean</option>
                <option value="zh">Mandarin Chinese</option>
            </select>
            <button
                type="submit"
                className='mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
            >
                Translate
            </button>

            {result && (
                <div className='mt-6 p-4 border rounded bg-gray-50'>
                    <h2 className='font-semibold mb-2'>Translation:</h2>
                    <pre className='whitespace-pre-wrap'>{result}</pre>
                </div>
            )}
        </form>
    )
}

