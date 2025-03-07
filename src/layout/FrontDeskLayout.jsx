import { Outlet } from "react-router-dom";

function FrontDeskLayout() {
  return (
    <div className="#">
      <Outlet />
    </div>
  );
}

export default FrontDeskLayout;
