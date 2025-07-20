import { NextResponse, type NextRequest } from "next/server";
import { validateToken } from "./lib/auth";

type ProtectedRoutes = {
    [key: string]: string[];
};

const PROTECTED_ROUTES: ProtectedRoutes = {
    "/dashboard/users": ["admin"],
    "/dashboard/dishes": ["admin","cashier"],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const matchedRoute = Object.keys(PROTECTED_ROUTES).find(route => 
        pathname.startsWith(route)
    ) as keyof typeof PROTECTED_ROUTES | undefined;
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
        
        return NextResponse.next();
    }else if ("/".startsWith(pathname)){
        const validation = await validateToken(req);
        if (validation.user) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }else if ("/dashboard".startsWith(pathname)){
        const validation = await validateToken(req);
        if (validation.error){
            return NextResponse.redirect(new URL("/", req.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
