import { NextResponse, type NextRequest } from "next/server";

// export const config = {
//     matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export function middleware(request: NextRequest) {
//     console.log("alo")
//     const token = request.cookies.get("access_token")?.value;
//     const { pathname } = new URL(request.url);

//     // Rutas públicas
//     const publicRoutes = ["/"];
//     // Rutas protegidas
//     const protectedRoutes = ["/dashboard"];

//     if (token && publicRoutes.includes(pathname)) {
//         return NextResponse.redirect(new URL("/dashboard", request.url));
//     }

//     if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
//         return NextResponse.redirect(new URL("/", request.url));
//     }

//     return NextResponse.next();
// }

import { validateToken } from "./lib/auth";

type ProtectedRoutes = {
  [key: string]: string[]; // Roles permitidos
};

// Configuración de rutas protegidas y roles permitidos
const PROTECTED_ROUTES: ProtectedRoutes = {
    "/dashboard/users": ["superadmin"],
    "/dashboard/dishes": ["superadmin","admin"],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const matchedRoute = Object.keys(PROTECTED_ROUTES).find(route => 
        pathname.startsWith(route)
    ) as keyof typeof PROTECTED_ROUTES | undefined;;

    if (matchedRoute) {
        const validation = await validateToken(req);
        
        if (validation.error) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        
        const allowedRoles = PROTECTED_ROUTES[matchedRoute];
        const userRole = validation.user?.rol;
        
        if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        const headers = new Headers(req.headers);
        headers.set("x-user-role", userRole);
        
        return NextResponse.next({
            request: { headers }
        });
    }

    return NextResponse.next();
}

// Configuración para activar el middleware solo en rutas específicas
export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/reports/:path*"
    ]
};