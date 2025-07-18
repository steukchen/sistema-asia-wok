import HeaderLogin from "./headerLogin";
import LoginForm from "./loginForm";

export default function Login() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 cursor-default font-inter">
            <HeaderLogin />
            <LoginForm />
        </div>
    );
}
