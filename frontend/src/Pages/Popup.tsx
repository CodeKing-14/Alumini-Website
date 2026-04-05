import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface PopupProps {
  open: boolean;
  onClose: () => void;
}

const Popup = ({ open, onClose }: PopupProps) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      // Small delay for entrance animation
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  const handleRegister = () => {
    onClose();
    navigate("/login");
  };

  const overlay = (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-out ${
      show ? "bg-slate-900/60 backdrop-blur-sm opacity-100" : "bg-transparent backdrop-blur-none opacity-0"
    }`}>
      
      <div 
        className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 transform ${
          show ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/30 transition-colors"
        >
          &#x2715;
        </button>

        {/* Top Image Banner */}
        <div className="relative h-40 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-900/40 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3">
              <span className="text-3xl">🎓</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 text-center bg-white relative">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Join Your Alumni Network
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Register now to connect with old friends, explore job opportunities, and get exclusive invites to college events.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="px-8 py-3 w-full sm:w-auto btn-gradient font-bold rounded-xl shadow-md transition-all"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default Popup;
