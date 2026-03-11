import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface PopupProps {
  open: boolean;
  onClose: () => void;
}

const Popup = ({ open, onClose }: PopupProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleRegister = () => {
    // close the popup and go to the login page
    onClose();
    navigate("/login");
  };

  const overlay = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-12">
      <div className="h-3/4 w-full flex items-start justify-center">
        <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          {/* close button in top-right corner */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            &#x2715;
          </button>

          <h2 className="text-lg font-bold">Register Your Alumni Account</h2>
          <button
            type="button"
            onClick={handleRegister}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default Popup;
