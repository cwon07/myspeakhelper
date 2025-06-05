import { useState, FormEvent } from 'react'
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis'

const API = process.env.NEXT_PUBLIC_API_URL

async function translateText(text: string, target: string) {
    const res = await fetch(`${API}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    const { play, pause, resume, stop, status } = useSpeechSynthesis()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)
        setResult('')
        stop()

        try {
            const t = await translateText(text, target)
            setResult(t)
        } catch (err:any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return(
        <form onSubmit={onSubmit} className='p-4 max-w-lg mx-auto space-y-4'>
            <h1 className='text-2xl font-bold'>Translate Text</h1>

            <label className='block mb-1'>Original text:</label>
            <textarea
                className='w-full h-32 border rounded p-2'
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Type text to translate...'
            />

            <label className='block font-medium'>Target language:</label>
            <select
                className='w-full-border rounded p-2'
                value={target}
                onChange={(e) => setTarget(e.target.value)}
            >
                <option value="en">English</option>
                <option value="ko">Korean</option>
                <option value="zh">Mandarin Chinese</option>
                <option value="es">Spanish</option>
            </select>

            <button
                type="submit"
                className='mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50'
            >
                {loading ? "Translating..." : "Translate"}
            </button>

            {error && <p className='text-red-500'>{error}</p>}

            {result && (
                <div className='mt-6 p-4 border rounded bg-gray-50 space-y-2'>
                    <div className='flex justify-between items-center'>
                        <h2 className='font-semibold'>Translation:</h2>
                        <div className='space-x-2'>
                            {status !== 'playing' && (
                                <button
                                    onClick={() => play(result)}
                                    className='text-blue-600 hover:underline'
                                    title='Play aloud'
                                    type='button'
                                >
                                    🔊 Play
                                </button>
                            )}
                            {status === 'playing' && (
                                <button 
                                    onClick={pause}
                                    className='text-blue-600 hover:underline'
                                    title='Pause'
                                    type='button'
                                >
                                    ⏸ Pause
                                </button>
                            )}
                            {status === 'paused' && (
                                <button
                                    onClick={resume}
                                    className='text-blue-600 hover:underline'
                                    title='Resume'
                                    type='button'
                                >
                                    ▶️ Resume 
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    stop()
                                    play(result)
                                }}
                                className='text-blue-600 hover:underline'
                                title='Restart'
                                type='button'
                            >
                                🔄 Restart
                            </button>
                        </div>
                    </div>                   
                    <pre className='whitespace-pre-wrap'>{result}</pre>
                </div>
            )}
        </form>
    )
}

