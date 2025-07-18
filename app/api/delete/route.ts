import { NextRequest, NextResponse } from "next/server";
import { VARS } from "@/app/utils/env";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
    const token = (await cookies()).get("access_token")?.value;
    const url = request.nextUrl.searchParams.get("url");

    console.log(VARS.API_URL + url);
    const response = await fetch(VARS.API_URL + url, {
        headers: { Authorization: "Bearer " + token },
        method: "DELETE",
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
