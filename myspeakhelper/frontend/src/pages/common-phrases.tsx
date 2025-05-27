import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

type Phrases = {
    greetings: string[]
    introductions: string[]
    phone_expressions: string[]
    customer_service: string[]
    email_signoffs: string[]
}

export default function CommonPhrasesPage() {
    const [ phrases, setPhrases ] = useState< Phrases | null >(null)
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState('')

    useEffect(() => {
        async function fetchPhrases() {
            try {
                const res = await fetch(`${API}/common-phrases`)
                if (!res.ok) throw new Error('Network response was not ok')
                    const data = (await res.json()) as Phrases
                setPhrases(data)
            } catch (err: any) {
                setError(err.message || 'Something went wrong')
            } finally {
                setLoading(false)
            }
        }
        fetchPhrases()
    }, [])

    if (loading) return <p className='p-4'>Loading phrases...</p>
    if (error) return <p className='p-4 text-red-500'>Error: {error}</p>

    return (
        <div className='p-4 max-w-xl mx-auto space-y-6'>
            <h1 className='text-2xl font-bold'>Common Phrases</h1>

            {Object.entries(phrases!).map(([category, list]) => (
                <section key ={category}>
                    <h2 className='text-xl font-semibold capitalize mb-2'>
                        {category.replace('_', ' ')}
                    </h2>
                    <ul className='list-disc list-inside space-y-1'>
                        {(list as string[]).map((line, i) => (
                            <li key={i} className='px-2'>
                            {line}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    )
}