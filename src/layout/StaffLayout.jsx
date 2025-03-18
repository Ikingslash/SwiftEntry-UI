import { Outlet } from "react-router-dom";
import FlashMessage from "./FlashMessage";


function StaffLayout() {
  return (
    <div className="">
       <FlashMessage/>
      <Outlet />
    </div>
  );
}

export default StaffLayout;
