// app/api/auth/me/route.ts
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserPayload } from "@/types/user";

export const dynamic = 'force-dynamic'

export async function GET() {
    const user = await getCurrentUser()
    if(!user){
        return NextResponse.json(null, {status: 401})
    }
    // Use type assertion for clarity
    return NextResponse.json(user as UserPayload);
}