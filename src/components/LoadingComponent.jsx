import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.min.css";
import loading1 from "../assets/loading1.json";
import loading2 from "../assets/loading2.json";
import loading3 from "../assets/loading3.json";
import loading4 from "../assets/loading4.json";
import loading5 from "../assets/loading5.json";

function App() {
  const [animationData, setAnimationData] = useState(null);
  const animations = [loading1, loading2, loading3, loading4, loading5];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * animations.length);
    setAnimationData(animations[randomIndex]);
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
