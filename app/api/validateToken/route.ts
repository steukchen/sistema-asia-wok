import { NextResponse } from "next/server";
import { VARS } from "@/app/utils/env";
import { cookies } from "next/headers";

export async function GET() {
    const token = (await cookies()).get("access_token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Token no encontrado" }, { status: 401 });
    }

    const response = await fetch(VARS.API_URL + "/validate_token", {
        headers: { Authorization: "Bearer " + token },
    });

    if (!response.ok) {
        return NextResponse.json({ error: await response.json() }, { status: response.status });
    }

    const data: DataResponse = await response.json();
    const user_data = data.user_data;

    return NextResponse.json({"user_data":user_data,"ws_token":data.ws_token});
}
