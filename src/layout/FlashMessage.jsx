import check from "../assets/icons/check.svg";
import close from "../assets/icons/Close.svg";
import danger from "../assets/icons/Danger.svg";
import warning from "../assets/icons/warning.svg";
import { useFlash } from "../context/FlashProvider";

function FlashMessage() {
  const { visible, hideFlash, flashMessage } = useFlash();

  return (
    <>
      {visible && (
        <div className=" animate-pulse bg-[#FFFFFF]  w-[300px] h-[100px] border rounded-[8px] fixed top-[2%] right-[2%] p-4 space-y-2 z-50">
          <div className="flex justify-between space-x-[10px] items-center ">
            <div className="flex justify-start space-x-[10px]  items-center">
              <img
                className="w-[20px] h-[20px]"
                src={
                  flashMessage.type === "success"
                    ? check
                    : flashMessage.type === "warning"
                    ? warning
                    : flashMessage.type === "danger"
                    ? danger
                    : null
                }
              />
              <h3
                className={`font-poppins text-[18px] font-medium ${
                  flashMessage.type === "success"
                    ? "text[#4CAF50]"
                    : flashMessage.type === "warning"
                    ? "text-[#FF993A]"
                    : "text-[#EA0234]"
                }`}
              >
                {flashMessage.heading}
              </h3>
            </div>
            <img
              onClick={hideFlash}
              className="w-[12px] h-[12px] cursor-pointer"
              src={close}
            />
          </div>
          <p className="font-poppins text-[14px] font-normal text-center">
            {flashMessage.message}
          </p>
        </div>
      )}
    </>
  );
}

export default FlashMessage;
