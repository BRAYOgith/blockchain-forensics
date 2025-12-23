"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function register(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { error: "Missing email or password" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Email already exists" }
        }
        return { error: "Something went wrong" }
    }
}
