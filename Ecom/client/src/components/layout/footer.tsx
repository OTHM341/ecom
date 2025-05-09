import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-display font-bold mb-4">
              O&N <span className="text-secondary">Shop</span>
            </h3>
            <p className="text-neutral-400 mb-4">
              Your one-stop shop for high-quality products with excellent customer service and fast, reliable shipping.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-neutral-400 hover:text-white transition" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-neutral-400 hover:text-white transition" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-neutral-400 hover:text-white transition" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-medium mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/all" className="text-neutral-400 hover:text-white transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/category/all?sort=bestseller" className="text-neutral-400 hover:text-white transition">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/category/all?sale=true" className="text-neutral-400 hover:text-white transition">
                  Sale Items
                </Link>
              </li>
              <li>
                <Link href="/category/all" className="text-neutral-400 hover:text-white transition">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-neutral-400 hover:text-white transition">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-medium mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-neutral-400 hover:text-white transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-neutral-400 hover:text-white transition">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-neutral-400 hover:text-white transition">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-medium mb-4">Stay Updated</h4>
            <p className="text-neutral-400 mb-4">
              Subscribe to our newsletter for the latest products and deals.
            </p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-neutral-700 text-white border-0 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
              <Button 
                className="bg-primary hover:bg-primary-600 rounded-l-none" 
                type="submit"
                aria-label="Subscribe to newsletter"
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} O@N Shop. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy-policy" className="text-neutral-400 hover:text-white transition text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white transition text-sm">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-neutral-400 hover:text-white transition text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
