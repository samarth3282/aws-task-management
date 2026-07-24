import { Menu } from "lucide-react";
import { PRODUCT_NAME } from "../../config";
import TaskflowLogo from "../ui/TaskflowLogo.jsx";

export default function MobileHeader({ onOpenSidebar }) {
  return (
    <header className="mobile-header">
      <div className="mobile-header__logo">
        <TaskflowLogo className="nav__logo-mark" aria-hidden="true" />
        {PRODUCT_NAME}
      </div>
      <button 
        type="button" 
        className="mobile-header__menu-btn" 
        onClick={onOpenSidebar}
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>
    </header>
  );
}
