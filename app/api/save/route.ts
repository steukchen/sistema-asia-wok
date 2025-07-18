import { NextRequest, NextResponse } from "next/server";
import { VARS } from "@/app/utils/env";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const token = (await cookies()).get("access_token")?.value;
    const url = request.nextUrl.searchParams.get("url");

    const body = await request.json();
    console.log(body)
    const response = await fetch(VARS.API_URL + url, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (response.status == 401) {
        return NextResponse.json({ error: "Token Invalido" }, { status: 401 });
    } else if (!response.ok) {
        const data = await response.json();
        console.log(data);
        return NextResponse.json({ error: data }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
    const token = (await cookies()).get("access_token")?.value;
    const url = request.nextUrl.searchParams.get("url");
    const body = await request.json();

    const response = await fetch(VARS.API_URL + url, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (response.status == 401) {
        return NextResponse.json({ error: "Token Invalido" }, { status: 401 });
    } else if (!response.ok) {
        const data = await response.json();
        console.log(data);
        return NextResponse.json({ error: data }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
}
