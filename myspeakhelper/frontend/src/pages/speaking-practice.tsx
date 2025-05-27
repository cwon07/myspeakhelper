import { useState, FormEvent } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

async function practiceSpeaking(promptText: string) {
    const res = await fetch(`{API}/speaking-practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ text: promptText}),
    })
    if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
    return json.response as string
}

export default function SpeakingPracticePage() {
    const [ input, setInput ] = useState('')
    const [ conversation, setConversation ] = useState<string[]>([])
    const [ error, setError ] = useState('')
    const [ loading, setLoading ] = useState(false)

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const reply = await practiceSpeaking(input)
            setConversation(prev => [
                ...prev,
                `You: ${input}`,
                `Partner: ${reply}`
            ])
            setInput('')
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='p-4 max-w-xl mx-auto space-y-r'>
            <h1 className='text-2xl font-bold'>Speaking Practice</h1>
            <form onSubmit={onSubmit} className='space-y-2'>
                <label className='block font-medium'>Enter scenario or phrase:</label>
                <textarea 
                    className='w-full h-32 border rounded p-2'
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="E.g. 'I'd like to change my reservation date...'"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className='bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50'
                >
                    { loading ? 'Thinking...' : 'Practice' }
                </button>
            </form>

            { error && <p className='text-red-500'>{error}</p>}

            { conversation.length > 0 && (
                <div className='mt-4 space-y-3'>
                    {conversation.map((line, i) => (
                        <p key={i} className='whitespace-pre-wrap'>{line}</p>
                    ))}
                </div>
            )}
        </div>
    )
}