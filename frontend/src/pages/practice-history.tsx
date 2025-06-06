import RequireAuth from "@/components/RequireAuth";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

type PracticeEntry = {
    id: number
    prompt: string
    response: string
    created_at: string
}

export default function PracticeHistoryPage() {
    return (
        <RequireAuth>
            <HistoryContent />
        </RequireAuth>
    )
}

function HistoryContent() {
    const supabase = useSupabaseClient()
    const session = useSession()
    const [entries, setEntries] = useState<PracticeEntry[]>([])

    useEffect(() => {
        if (!session) return
        async function loadHistory() {
            const { data, error } = await supabase
                .from('practice_history')
                .select('*')
                .eq('user_id', session?.user.id)
                .order('created_at', {ascending:false})

                if (!error && data) {
                    setEntries(data)
                }
        }
            loadHistory()   
    }, [session, supabase])

    return (
        <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Practice History</h1>
      {entries.length === 0 ? (
        <p>No entries yet. Go practice and come back!</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((e) => (
            <li key={e.id} className="p-4 border rounded bg-white shadow-sm">
              <p className="font-medium">Prompt:</p>
              <p className="mb-2">{e.prompt}</p>
              <p className="font-medium">Response:</p>
              <p>{e.response}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(e.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
    )
}