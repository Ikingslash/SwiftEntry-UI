import { Outlet } from "react-router-dom";
// import FlashMessage from "./FlashMessage";

function FrontDeskLayout() {
  return (
    <div className="#">
       {/* <FlashMessage/> */}
      <Outlet />
    </div>
  );
}

export default FrontDeskLayout;
