export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Unauthorized
        </h1>
        <p className="mt-4 text-slate-600">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}