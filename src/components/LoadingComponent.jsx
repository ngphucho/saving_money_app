import React from "react";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.min.css";

// **Quan trọng:** Thay thế đường dẫn này bằng URL trực tiếp của file JSON Lottie
// hoặc import file JSON nếu bạn đã tải nó lên CodeSandbox.
// Ví dụ (URL):
import animationData from "../assets/loading2.json";

// Ví dụ (import - giả sử bạn đã tạo file animation.json trong thư mục src):
// import animationData from './animation.json';

function App() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      {animationData && (
        <Lottie options={defaultOptions} height={200} width={200} />
      )}
      {!animationData && (
        <p>Vui lòng thay thế URL hoặc import file JSON Lottie.</p>
      )}
      <h3 className="text-danger">... LOADING ...</h3>
    </div>
  );
}

export default App;
