import { Outlet } from "react-router-dom";
import FlashMessage from "./FlashMessage";
import { useAuth } from "../context/AuthContext"

function AdminLayout() {
  const {user} = useAuth()
  return (
    <div className="">
      <FlashMessage/>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
