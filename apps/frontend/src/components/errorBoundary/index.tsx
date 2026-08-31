import { useNavigate, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  const onClick = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <button
          type="button"
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          onClick={onClick}
        >
          Go home
        </button>
      </div>
    </div>
  );
}
