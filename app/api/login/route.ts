import { NextResponse, NextRequest } from "next/server";
import { VARS } from "@/app/utils/env";

export async function POST(request: NextRequest) {
    const { username, password } = await request.json();
    try {
        const apiResponse = await fetch(`${VARS.API_URL}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `username=${username}&password=${password}`,
        });
        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return NextResponse.json({ error: errorData }, { status: apiResponse.status });
        }

        const token = await apiResponse.json();

        const userResponse = await fetch(`${VARS.API_URL}/validate_token`, {
            method: "GET",
            headers: { Authorization: "Bearer " + token.access_token },
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            return NextResponse.json({ error: errorData }, { status: userResponse.status });
        }
        const userData: DataResponse = await userResponse.json();

        const response = NextResponse.json({user_data:userData.user_data,ws_token:userData.ws_token}, { status: 200 });

        response.cookies.set({
            name: "access_token",
            value: token.access_token,
            httpOnly: true,
            secure: VARS.ENV === "production",
            sameSite: VARS.ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 86400 * 7,
        });

        return response;
    } catch (err) {
        console.error("Error de login en servidor: ", err);
        return NextResponse.json({ error: err }, { status: 500 });
    }
}
