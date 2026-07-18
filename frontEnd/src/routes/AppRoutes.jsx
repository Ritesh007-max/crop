import { Routes, Route } from "react-router-dom";
import Auth from "../pages/Auth";
import Planning from "../pages/Planning";
import Health from "../pages/Health";
import Harvesting from "../pages/Harvesting";
import Selling from "../pages/Selling";
import Schemes from "../pages/Schemes";
import Subscription from "../pages/Subscription";
import NotFound from "../pages/NotFound";

function AppRoutes({ token, user, onLogin, onLogout, onEditProfile, props }) {
  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<Auth onLogin={onLogin} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Planning user={user} onLogout={onLogout} onEditProfile={onEditProfile} {...props.planning} />} />
      <Route path="/health" element={<Health user={user} onLogout={onLogout} onEditProfile={onEditProfile} {...props.health} />} />
      <Route path="/harvesting" element={<Harvesting user={user} onLogout={onLogout} onEditProfile={onEditProfile} {...props.harvesting} />} />
      <Route path="/selling" element={<Selling user={user} onLogout={onLogout} onEditProfile={onEditProfile} {...props.selling} />} />
      <Route path="/schemes" element={<Schemes user={user} onLogout={onLogout} onEditProfile={onEditProfile} {...props.schemes} />} />
      <Route path="/subscription" element={<Subscription user={user} onLogout={onLogout} onEditProfile={onEditProfile} {...props.subscription} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
