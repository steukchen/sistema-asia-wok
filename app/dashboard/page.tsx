'use client'
import { useAuth } from "../providers/authProvider";

export default function DashBoard() {
    const {user} = useAuth()

    return <h1 className="text-orange-800 text-5xl">{user?.username}</h1>;
}
