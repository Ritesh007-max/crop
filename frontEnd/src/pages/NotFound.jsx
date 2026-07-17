import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-surface-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 mb-6 mx-auto">
        <Sprout size={32} />
      </div>
      <h1 className="font-display font-bold text-4xl sm:text-5xl text-gray-900 mb-4">
        404
      </h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:-translate-y-0.5 transition-all duration-200"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
