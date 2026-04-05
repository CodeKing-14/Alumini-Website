import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-slate-950 text-slate-300 py-12 mt-auto border-t-[4px] border-blue-600 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-blue-600 opacity-10 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md">
                SR
              </div>
              SRIT Alumni Association
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              The SRIT Alumni Association was formed to foster lasting connections among alumni, strengthen the bond with our alma mater, and build a network of excellence across generations.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/about')} className="hover:text-blue-400 transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('/events')} className="hover:text-blue-400 transition-colors">Events & Reunions</button></li>
              <li><button onClick={() => navigate('/gallery')} className="hover:text-blue-400 transition-colors">Photo Gallery</button></li>
              <li><button onClick={() => navigate('/member')} className="hover:text-blue-400 transition-colors">Members Directory</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Contact Details</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✉</span>
                <span className="text-slate-400">alumni@srit.edu</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">📞</span>
                <span className="text-slate-400">+91-XXXX-XXXX-XXXX</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">📍</span>
                <span className="text-slate-400">SRIT Campus, India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center sm:flex sm:justify-between sm:text-left text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} SRIT Alumni Association. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
