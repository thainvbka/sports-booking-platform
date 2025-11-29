import { Outlet } from "react-router-dom";
import { authBg } from "@/assets/index";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="hidden lg:flex flex-col justify-center items-center bg-muted p-10 text-white dark:border-r  bg-cover bg-center relative"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to SportBook</h1>
          <p className="text-lg text-gray-200">
            The easiest way to find and book sports fields near you.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
