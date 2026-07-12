import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-gray-950 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-red-600 rounded flex items-center justify-center">
                <Shield className="text-white h-3 w-3" />
              </div>
              <h4 className="text-lg font-bold">Veridian Tech</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Empowering American workers with world-class IT certification training.
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-300 hover:text-white">Dashboard</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Courses</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Progress</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Certificates</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-300 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Contact Support</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">WIOA Information</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Technical Issues</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Government Resources</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-300 hover:text-white">WIOA Official Site</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">CompTIA Certification</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Career Services</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white">Job Placement</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            &copy; 2024 Veridian Tech. Government Certified Training Platform. Supporting American workforce development.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-slate-400 text-sm">Proudly Made in the USA</span>
            <Shield className="text-red-600 h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}