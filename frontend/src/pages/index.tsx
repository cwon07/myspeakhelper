import React from 'react';
import Link from 'next/link'

export default function Home() {
  return (
    
    <main className="p-8 max-w-lg max-auto">
      <h1 className="text-2xl font-bold mb-6">MySpeakHelper</h1>
        <nav className='space-y-3'>
          <Link href="/email-check" className='block text-blue-600 hover:underline'>
          Improve Email 
          </Link>
          <Link href="/translate" className='block text-blue-600 hover:underline'>
          Translate Text
          </Link>
          <Link href="/generate-phrases" className='block text-blue-600 hover:underline'>
          Common Phrases
          </Link>
          <Link href="/speaking-practice" className='block text-blue-600 hover:underline'>
          Speaking Pracetice
          </Link>
          <Link href="/speech-to-text" className='block text-blue-600 hover:underline'>
          Speech-to-Text
          </Link>
        </nav>
    </main>
  );
}