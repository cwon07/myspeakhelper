import { useRef, useCallback, useEffect, useState } from "react";

export default function useSpeechSynthesis() {

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const [ status, setStatus ] = useState<'idle' | 'playing' | 'paused'>('idle')

    const play = useCallback((text:string) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech Synthesis not supported in this browser.')
            return
        }

        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utteranceRef.current = utterance

        utterance.onstart = () => setStatus('playing')
        utterance.onend = () => setStatus('idle')
        utterance.onerror = () => setStatus('idle')
        utterance.onpause = () => setStatus('paused')
        utterance.onresume = () => setStatus('playing')

        window.speechSynthesis.speak(utterance)
    }, [])

    const pause = useCallback(() => {
        if (utteranceRef.current && status === 'playing') {
            window.speechSynthesis.pause()
        }
    }, [status])

    const resume = useCallback(() => {
        if (utteranceRef.current && status === 'paused') {
            window.speechSynthesis.resume()
        }
    }, [status])

    const stop = useCallback(() => {
        window.speechSynthesis.cancel()
        utteranceRef.current = null
        setStatus('idle')
    }, [])

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel()
            utteranceRef.current = null
        }
    }, [])

    return { play, pause, resume, stop, status }
}