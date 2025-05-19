import { Outlet } from "react-router-dom";
// import FlashMessage from "./FlashMessage";

function SecurityLayout() {
  return (
    <div className="">
       {/* <FlashMessage/> */}
      <Outlet />
    </div>
  );
}

export default SecurityLayout;
