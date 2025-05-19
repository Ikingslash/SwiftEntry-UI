import { Outlet } from "react-router-dom";
// import FlashMessage from "./FlashMessage";


function AdminLayout() {
 
  return (
    <div className="">
      {/* <FlashMessage/> */}
      <Outlet />
    </div>
  );
}

export default AdminLayout;
