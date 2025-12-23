"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/lib/actions"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function Register() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const result = await register(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push("/login")
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4 text-blue-500">
                        <ShieldAlert size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Join CryptoTrace</h1>
                    <p className="text-slate-400 text-sm mt-2">Create an account to start tracing assets</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-white p-3.5 rounded-xl font-mono"
                            placeholder="investigator@agency.gov"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-white p-3.5 rounded-xl font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 mt-4 active:scale-95"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold underline underline-offset-4 decoration-2">
                        Login
                    </Link>
                </p>

                <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
                        Compliance Notice: Data Protection Act 2019 Applied. <br />
                        Only essential investigator credentials collected.
                    </p>
                </div>
            </div>
        </div>
    )
}
