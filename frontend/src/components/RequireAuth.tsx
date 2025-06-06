import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const session = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session === null) {
            return
        }
        if (!session) {
            router.replace('/login')
        }
    }, [session, router])

    if (!session) {
        return <p className="p-4 text-center">Checking authentication...</p>
    }

    return <>{children}</>
}