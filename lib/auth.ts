import { VARS } from "@/app/utils/env";
import { NextRequest } from "next/server";

export async function validateToken(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value;
    
    if (!token) {
        return { error: "Token no encontrado", status: 401 };
    }

    try {
        const response = await fetch(VARS.API_URL + "/validate_token", {
            headers: { Authorization: "Bearer " + token },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData, status: response.status };
        }

        const data = await response.json();
        return { user: data.user_data };
        
    } catch (error) {
        console.log(error)
        return { error: "Error de conexión", status: 500 };
    }
}