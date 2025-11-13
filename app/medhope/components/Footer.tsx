export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">MedHope</h3>
            <p className="text-gray-400">
              Restoring lives, one prescription at a time. A secure, intelligent, and charity-based medicine donation system.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/auth/register" className="hover:text-primary transition-colors">Sign Up</a></li>
              <li><a href="/auth/login" className="hover:text-primary transition-colors">Login</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">
              Email: support@medhope.com
            </p>
            <p className="text-gray-400 mt-2">
              Phone: +92 300 1234567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MedHope. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

