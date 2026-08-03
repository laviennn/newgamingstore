import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Login - Admin BO",
  description: "Login untuk Admin Backoffice",
};

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-8 bg-background border rounded-lg shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-primary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Admin Backoffice</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Silakan masuk dengan akun yang telah didaftarkan oleh SuperAdmin.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
