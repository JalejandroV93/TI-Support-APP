// app/api/auth/me/route.ts
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export async function GET() {
    const user = await getCurrentUser()
    if(!user){
        return NextResponse.json(null, {status: 401})
    }
    return NextResponse.json(user);
}