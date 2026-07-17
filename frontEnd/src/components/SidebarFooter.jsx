import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

function SidebarFooter({ user, onLogout, onEditProfile }) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-t border-brand-900/40">
      <LanguageSelector />
      {user && (
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={onEditProfile}
            className="flex-1 text-left min-w-0 mr-2 p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
            title="Edit profile & location"
          >
            <p className="text-[13px] font-semibold text-brand-200 group-hover:text-brand-100 truncate">{user.name}</p>
            <p className="text-[11px] text-brand-500 group-hover:text-brand-400 truncate flex items-center gap-1.5">
              <span className="text-brand-400">📍</span>
              <span className="truncate">
                {user.district && user.state ? `${user.district}, ${user.state}` : user.email}
              </span>
            </p>
          </button>
          <button
            onClick={onLogout}
            title={t("common.signOut")}
            className="p-2 rounded-lg hover:bg-red-500/15 text-brand-500 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default SidebarFooter;
