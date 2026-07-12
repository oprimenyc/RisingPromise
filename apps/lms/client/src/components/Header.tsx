import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";

export default function Header() {
  const { user } = useAuth();
  const typedUser = user as UserType | undefined;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-red-600 rounded flex items-center justify-center">
                <Shield className="text-white h-4 w-4" />
              </div>
              <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300">
                Veridian Tech
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Dashboard
            </Link>
            <a href="#" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Courses
            </a>
            <a href="#" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Progress
            </a>
            <a href="#" className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Support
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {typedUser && (
              <div className="hidden md:block text-sm text-slate-600 dark:text-gray-300">
                <span>{typedUser.firstName} {typedUser.lastName}</span>
              </div>
            )}
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-profile"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}