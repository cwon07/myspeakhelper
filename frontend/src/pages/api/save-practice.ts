import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const { prompt, response } = req.body
    const token = req.headers.authorization || ''

    const backendRes = await fetch(`${backendUrl}/practice-history`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        body: JSON.stringify({ prompt, response }),
    })
    const data = await backendRes.json()
    if (!backendRes.ok) {
        res.status(backendRes.status).json(data)
    } else {
        res.status(200).json(data)
    }
}