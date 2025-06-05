import { useState, FormEvent, useSyncExternalStore } from 'react'
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis'

const API = process.env.NEXT_PUBLIC_API_URL


export default function CommonPhrasesPage() {
    const [ input, setInput ] = useState('')
    const [ phrases, setPhrases ] = useState<string[]>([])
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState('')

    const { play, pause, resume, stop, status } = useSpeechSynthesis()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!input.trim()) {
            setError('Please type a situation or keyword.')
            return
        }
        setError('')
        setLoading(true)
        setPhrases([])
        stop()
        try {
            const res = await fetch(`${API}/generate-phrases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ query: input.trim()}),
            })
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'Network response was not ok')
            }
            const json = (await res.json()) as { phrases: string[]}
            setPhrases(json.phrases)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='p-4 max-w-xl mx-auto space-y-6'>
            <h1 className='text-2xl font-bold'>Common Phrases</h1>

            <form onSubmit={onSubmit} className='space-y-4'>
                <label className='block font-medium'>
                    Describe your situation:
                </label>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='e.g. ask for refund policy'
                    className='w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400'
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
                >
                    {loading ? 'Thinking...' : 'Get Phrases'}
                </button>
            </form>

            {error && <p className='text-red-500'>{error}</p>}

            {phrases.length > 0 && (
                <section className='mt-6 space-y-2'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-xl font-semibold'>Useful Phrases:</h2>
                        <div className='space-x-2'>
                            {status !== 'playing' && (
                                <button
                                    onClick={() => play(phrases.join('. '))}
                                    className='text-blue-600 hover:underline'
                                    title='read all'
                                    type='button'
                                >
                                    🔊 Play All
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
                                play(phrases.join('. '))
                            }}
                            className='text-blue-600 hover:underline'
                            title='Restart'
                            type='button'
                            >
                                🔄 Restart
                            </button>
                        </div>
                    </div>
                    <ul className='list-disc list-inside space-y-1'>
                        {phrases.map((line, idx) => (
                            <li key={idx} className='px-2'>
                                <span>{line}</span>
                                <button 
                                    onClick={() => play(line)}
                                    className='text-blue-500 hover:underline text-sm'
                                    title='Play this phrase'
                                    type='button'
                                >
                                    🔊
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}