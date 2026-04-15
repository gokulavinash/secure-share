import { Shield, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 md:py-16"
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Secure File Sharing</h3>
                <p className="text-sm text-gray-400">Encrypted & Protected</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Share files securely with end-to-end encryption. Admin-approved
              downloads ensure your data stays protected at every step.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#hero"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/user/login"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Sign In
                </a>
              </li>
              <li>
                <a
                  href="/user/signup"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a
                    href="mailto:support@securefilesharing.com"
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                  >
                    support@securefilesharing.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <a
                    href="tel:+1234567890"
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-gray-300 text-sm">
                    123 Security Street
                    <br />
                    Tech City, TC 12345
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Secure File Sharing. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
