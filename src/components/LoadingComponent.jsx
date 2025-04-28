import React from "react";
import Lottie from "react-lottie";

// **Quan trọng:** Thay thế đường dẫn này bằng URL trực tiếp của file JSON Lottie
// hoặc import file JSON nếu bạn đã tải nó lên CodeSandbox.
// Ví dụ (URL):
import animationData from "../assets/heart_2s.json";

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
      <h1>Lottie trong CodeSandbox</h1>
      {animationData && (
        <Lottie options={defaultOptions} height={200} width={200} />
      )}
      {!animationData && (
        <p>Vui lòng thay thế URL hoặc import file JSON Lottie.</p>
      )}
    </div>
  );
}

export default App;
