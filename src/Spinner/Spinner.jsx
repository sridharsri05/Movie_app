import { Spin } from "antd";

const Spinner = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-slate-600 bg-opacity-60 flex justify-center items-center ">
      <div className="  p-6 ">
        <Spin size="large" />{" "}
        <span className=" mx-4 font-libre text-white">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
