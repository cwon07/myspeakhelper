import { useState, FormEvent, DragEvent } from 'react'
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis'

const API = process.env.NEXT_PUBLIC_API_URL

export default function SpeechToTextPage() {
    const [ file, setFile ] = useState<File | null>(null)
    const [ transcript, setTranscript ] = useState('')
    const [ error, setError ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [ dragging, setDragging ] = useState(false)

    const { play, pause, resume, stop, status } = useSpeechSynthesis()

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setDragging(true)
    }

    function handleDragLeave(e: DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setDragging(false)
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped && dropped.type.startsWith('audio/')) {
            setFile(dropped)
            setError('')
        } else {
            setError('Please drop a valid audio file.')
        }
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if(!file) {
            setError('Please select or drop an audio file.')
            return
        }

        setError('')
        setLoading(true)
        setTranscript('')
        stop()

        try {
            const form = new FormData()
            form.append('file', file)

            const res = await fetch(`${API}/speech-to-text`, {
                method: 'POST',
                body: form,
            })
            if (!res.ok) throw new Error(await res.text())
            const json = (await res.json()) as { transcript: string }
            setTranscript(json.transcript)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='p-4 max-w-lg mx-auto space-y-4'>
            <h1 className='text-2xl font-bold'>Speech-to-Text</h1>

            <form onSubmit={onSubmit} className='space-y-4'>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('audio-input')?.click()}
                    className={`
                        flex items-center justify-center
                        h-32 border-2 rounded-md
                        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                        cursor-pointer
                        transition-colors
                    `}
                >
                    {file ? (
                        <p className='text-gray-700'>{file.name}</p>
                    ) : (
                        <p className='text-gray-500'>
                            {dragging
                                ? 'Release to upload your audio'
                                : 'Drag & drop audio here, or Click to select'}
                          </p>
                    )}

                    { /* hidden fallback input */}
                    <input
                        id='audio-input'
                        type='file'
                        accept='audio/*'
                        onChange={(e) => {
                            const selected = e.target.files?.[0] || null
                            if (selected && selected.type.startsWith('audio/')) {
                                setFile(selected)
                                setError('')
                            } else {
                                setError('Please select a valid audio file.')
                            }
                        }}
                        className='hidden'
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !file}
                    className='mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
                >
                    {loading ? 'Transcribing...' : 'Transcribe'}
                </button>
            </form>

            {error && <p className='text-red-500'>{error}</p>}

            {transcript && (
                <div className='mt-4 p-4 border rounded bg-gray-50 space-y-2'>
                    <div className='flex justify-between items-center'>
                        <h2 className='font-semibold mb-2'>Transcript:</h2>

                        <div className='space-x-2'>
                            {status !== 'playing' && (
                                <button
                                    onClick={() => play(transcript)}
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
                                    play(transcript)
                                }}
                                className='text-blue-600 hover:underline'
                                title='Restart'
                                type='button'
                            >
                                🔄 Restart
                            </button>
                        </div>
                    </div>
                    <p className='whitespace-pre-wrap'>{transcript}</p>
                </div>
            )}
        </div>
    )
}