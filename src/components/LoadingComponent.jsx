import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [animationData, setAnimationData] = useState(null);
  const numberOfAnimations = 5; // Số lượng file animation của bạn

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * numberOfAnimations) + 1;
    const animationPath = `/src/assets/loading${randomNumber}.json`; // Đường dẫn động

    import(animationPath)
      .then((module) => {
        setAnimationData(module.default);
      })
      .catch((error) => {
        console.error("Lỗi import animation data:", error);
        // Xử lý lỗi nếu không import được file (ví dụ: hiển thị animation mặc định)
      });
  }, []);

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
      {!animationData && <p>Đang tải animation...</p>}
      <h3 className="text-danger">... LOADING ...</h3>
    </div>
  );
}

export default App;
