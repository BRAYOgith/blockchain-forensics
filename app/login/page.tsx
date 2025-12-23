"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"

export default function Login() {
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const response = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (response?.error) {
                setError("Invalid email or password")
                setLoading(false)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("An unexpected error occurred")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl mb-4 text-indigo-500">
                        <Search size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Investigator Login</h1>
                    <p className="text-slate-400 text-sm mt-2">Access your forensic tools</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-white p-3.5 rounded-xl font-mono"
                            placeholder="name@agency.gov"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-white p-3.5 rounded-xl font-mono"
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
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 mt-4 active:scale-95"
                    >
                        {loading ? "Verifying..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    New investigator?{" "}
                    <Link href="/register" className="text-indigo-500 hover:text-indigo-400 font-semibold underline underline-offset-4 decoration-2">
                        Create Account
                    </Link>
                </p>

                <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
                        Secure Entry Point <br />
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    )
}
