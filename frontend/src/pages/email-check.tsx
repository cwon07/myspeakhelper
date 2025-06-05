import { useState, FormEvent } from 'react'
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis'

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
            const improved = await improveEmail(email, tone)
            setResult(improved) 
        } catch (erro:any) {
            setError(erro.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }       
    }

    return(
        <div className='p-4 max-w-lg mx-auto space-y-4'>
            <h1 className='text-2-xl font-bold'>Emprove Email</h1>

                <form onSubmit={onSubmit} className='p-4 max-w-lg mx-auto'>
                    <label className='block mb-1'>Draft email:</label>
                    <textarea
                        className='w-full h-32 border rounded p-2'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder='Type your email here...'
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
                        { loading ? 'Improving...' : 'Improve'} 
                    </button>
                </form>

                {error && <p className='text-red-500'>{error}</p>}

            {result && (
                <div className='mt-6 p-4 border rounded bg-gray-50 space-y-2'>
                    <div className='flex justify-between items-center'>
                        <h2 className='font-semibold mb-2'>Suggestions:</h2>
                        <div className='space-x-2'>
                            {/* Only show Play if idle or paused */}
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
                            {/* Show Pause if currently playing */}
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
                            {/* Show Resume if paused */}
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
                            {/* Always allow Restart (stop + play from beginning) */}
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
        </div>
    )
}