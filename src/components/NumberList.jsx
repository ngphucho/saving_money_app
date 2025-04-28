import React, { useState, useEffect, useRef } from "react";
import "../styles/NumberList.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Row, Col, ProgressBar, Form, Modal, Button } from "react-bootstrap";
import AdminPanel from "./AdminPanel";
import LoadingComponent from "./LoadingComponent";

function NumberList() {
  const [numbers, setNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [year, setYear] = useState(null); // Thêm state year
  const [showAdminPanel, setShowAdminPanel] = useState(false); // State để điều khiển hiển thị AdminPanel
  const [showAuthModal, setShowAuthModal] = useState(false); // State để điều khiển modal xác thực
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [numberToToggle, setNumberToToggle] = useState(null);
  const [nextState, setNextState] = useState("");
  const [showRandomConfirmModal, setShowRandomConfirmModal] = useState(false);
  const [showRandomSuccessModal, setShowRandomSuccessModal] = useState(false);
  const [lastCreatedRandomNumber, setLastCreatedRandomNumber] = useState(null);
  const [totalSum, setTotalSum] = useState(0);
  const [currentTrueSum, setCurrentTrueSum] = useState(0);
  const currentYear = new Date().getFullYear();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_ENDPOINT = "https://67f1267ac733555e24ac4c9b.mockapi.io/api/data/1";
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const colors = {
    primary: "#FF8195", // Hồng tươi
    secondary: "#F9476C", // Hồng đậm
    background: "#FAF2E8", // Trắng ngà
    text: "#333", // Đen nhạt
    light: "#FDD5C8", // Hồng nhạt
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.numbers) {
        setNumbers(data.numbers);
      } else {
        console.warn("API returned no 'numbers' data.");
      }
      setHistory(data.history);
      setYear(data.year); // Lấy giá trị year từ response
    } catch (e) {
      setError(e.message);
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numbers, history, year }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Data saved successfully!");
    } catch (e) {
      setError(e.message);
      console.error("Failed to save data:", e);
    }
  };

  const handleShowAdminPanelRequest = () => {
    setShowAuthModal(true);
    setAuthCode("");
    setAuthError("");
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setAuthCode("");
    setAuthError("");
  };

  const handleAuthCodeChange = (event) => {
    setAuthCode(event.target.value);
  };

  const handleOpenAdminPanel = () => {
    if (authCode === "123456") {
      setShowAdminPanel(true);
      setShowAuthModal(false);
      setAuthCode("");
      setAuthError("");
    } else {
      setAuthError("Mã xác thực không đúng.");
    }
  };

  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
  };

  const handleResetNumbers = (newNumbers, newHistory, newYear) => {
    setNumbers(newNumbers);
    setHistory(newHistory);
    setYear(newYear);
  };

  const handleShowAdminPanel = () => {
    setShowAdminPanel(true);
  };

  function getProgressBarVariant(percentage) {
    if (percentage >= 0 && percentage <= 10) {
      return "danger";
    } else if (percentage > 10 && percentage <= 40) {
      return "warning";
    } else if (percentage > 40 && percentage <= 100) {
      return "success";
    }
    return "primary";
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const sum = numbers.reduce((acc, curr) => acc + (curr ? curr.value : 0), 0);
    setTotalSum(sum * 1000);
  }, [numbers]);

  useEffect(() => {
    const trueSum = numbers.reduce(
      (acc, curr) => acc + (curr && curr.state === "true" ? curr.value : 0),
      0
    );
    setCurrentTrueSum(trueSum * 1000);
  }, [numbers]);

  useEffect(() => {
    if (totalSum > 0) {
      setCompletionPercentage(((currentTrueSum / totalSum) * 100).toFixed(2));
    } else {
      setCompletionPercentage(0);
    }
  }, [currentTrueSum, totalSum]);

  useEffect(() => {
    if (numbers.length > 0) {
      saveData();
    }
  }, [numbers, history, year]);

  const formatNumber = (number) => {
    return number ? number.toString().padStart(3, "0") : "---";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const logHistory = (value, oldState, newState, action) => {
    const formattedValue = formatNumber(value);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const timestamp = `${date} ${time}`;
    const message = `${timestamp} | ${formattedValue} | ${
      newState === "true" ? "circle-fill" : "circle"
    } | ${action}`;
    setHistory((prevHistory) => [...prevHistory, message]);
  };

  const toggleState = (value) => {
    setNumbers((prevNumbers) => {
      return prevNumbers.map((number) => {
        if (number && number.value === value) {
          const oldState = number.state;
          const newState = number.state === "true" ? "false" : "true";
          logHistory(value, oldState, newState, "MOD");
          return { ...number, state: newState };
        }
        return number;
      });
    });
  };

  const createRandomTrue = () => {
    setShowRandomConfirmModal(true);
  };

  const handleConfirmRandomTrue = () => {
    const falseNumbers = numbers.filter(
      (number) => number && number.state === "false"
    );

    if (falseNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * falseNumbers.length);
      const randomNumberToUpdate = falseNumbers[randomIndex].value;

      setNumbers((prevNumbers) => {
        return prevNumbers.map((number) => {
          if (number && number.value === randomNumberToUpdate) {
            logHistory(randomNumberToUpdate, "false", "true", "RAND");
            setLastCreatedRandomNumber(formatNumber(randomNumberToUpdate));
            setShowRandomSuccessModal(true);
            return { ...number, state: "true" };
          }
          return number;
        });
      });
    }
    setShowRandomConfirmModal(false);
  };

  const handleCloseRandomConfirmModal = () => {
    setShowRandomConfirmModal(false);
  };

  const handleCloseRandomSuccessModal = () => {
    setShowRandomSuccessModal(false);
    setLastCreatedRandomNumber(null);
  };

  const confirmToggleState = (value) => {
    const number = numbers.find((number) => number && number.value === value);
    if (number) {
      setNumberToToggle(number);
      setNextState(number.state === "true" ? "TẮT" : "BẬT");
      setShowConfirmModal(true);
    }
  };

  const handleConfirmToggle = () => {
    if (numberToToggle) {
      toggleState(numberToToggle.value);
      setShowConfirmModal(false);
      setNumberToToggle(null);
    }
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setNumberToToggle(null);
  };

  const handleShowHistoryClick = () => {
    setShowHistoryModal(true);
  };

  const handleCloseHistoryClick = () => {
    setShowHistoryModal(false);
  };

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <LoadingComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger">Lỗi tải dữ liệu: {error}</div>
    );
  }

  return (
    <div
      className="container"
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        paddingBottom: "50px",
      }}
    >
      <div
        ref={headerRef}
        className="bg-light shadow-sm"
        style={{
          width: "100%",
          zIndex: 1000,
          position: "sticky",
          top: 0,
          backgroundColor: colors.light, // Nền header hồng nhạt
        }}
      >
        <div
          className="button-container p-2"
          style={{ backgroundColor: colors.light }}
        >
          {" "}
          {/* Nền button-container hồng nhạt */}
          <button
            onClick={createRandomTrue}
            className="btn btn-primary"
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            <span className="d-none d-md-inline-block">TẠO NGẪU NHIÊN</span>
            <span className="d-inline-block d-md-none" aria-hidden="true">
              <i className="bi bi-plus-circle"></i>
            </span>
          </button>
          <div
            className="logo-container"
            onClick={handleShowAdminPanelRequest}
            style={{ cursor: "pointer" }}
          >
            <span>
              <img
                src="/android-chrome-512x512.png"
                alt="Logo M&H"
                className="img-fluid"
                style={{
                  maxHeight: "50px",
                  marginRight: "5px",
                  verticalAlign: "middle",
                }}
              />
              <span style={{ color: colors.secondary }}>SAVING MONEY</span>{" "}
              {/* Màu chữ logo hồng đậm */}
            </span>
          </div>
          <button
            onClick={handleShowHistoryClick}
            className="btn btn-info"
            style={{
              width: "auto",
              minWidth: "0",
              backgroundColor: colors.secondary, // Nền nút lịch sử hồng đậm
              borderColor: colors.secondary,
            }}
          >
            <span
              className="d-none d-md-inline-block"
              style={{ color: "white" }}
            >
              &nbsp;&nbsp;XEM LỊCH SỬ&nbsp;&nbsp;
            </span>
            <span
              className="d-inline-block d-md-none"
              aria-hidden="true"
              style={{ color: "white" }}
            >
              <i className="bi bi-clock-history"></i>
            </span>
          </button>
        </div>

        <Row className="mb-2 align-items-center justify-content-between p-2">
          <Col
            xs={12}
            md="auto"
            className="mb-2 mb-md-0 text-md-left text-center goal-for-container"
          >
            <i
              className="bi bi-flag mr-2"
              style={{ color: colors.secondary }}
            ></i>{" "}
            {/* Icon mục tiêu hồng đậm */}
            <span>Goal for {year}:&nbsp;</span>
            <strong className="ml-1" style={{ color: colors.primary }}>
              {formatCurrency(totalSum)}
            </strong>{" "}
            {/* Số mục tiêu hồng tươi */}
          </Col>
          <Col xs={12} md="auto" className="mb-2 mb-md-0 text-center">
            {" "}
            <i className="bi bi-wallet mr-2" style={{ color: "green" }}></i>
            <span>&nbsp;Current:&nbsp;</span>
            <strong className="ml-1" style={{ color: "green" }}>
              {formatCurrency(currentTrueSum)}
            </strong>
          </Col>
          <Col
            xs={12}
            md="auto"
            className="text-right d-flex align-items-center justify-content-end"
          >
            {" "}
            <i
              className="bi bi-graph-up-arrow mr-2 d-none d-md-inline"
              style={{ color: colors.secondary }}
            ></i>
            <span
              className="mr-2 d-none d-md-inline"
              style={{ color: colors.text }}
            >
              &nbsp;Progress:&nbsp;
            </span>{" "}
            {/* Chữ Progress đen nhạt */}
            <ProgressBar
              animated
              now={parseFloat(completionPercentage)}
              label={`${completionPercentage}%`}
              variant={getProgressBarVariant(parseFloat(completionPercentage))}
              style={{
                width: "100%",
                minWidth: "150px",
                marginTop: "0",
                backgroundColor: colors.light,
                borderColor: colors.light,
              }} // Nền progress bar hồng nhạt
            />
          </Col>
        </Row>
      </div>

      <div className="number-grid mt-3" style={{ padding: "1px" }}>
        {numbers.map((item, index) => (
          <div
            key={item ? item.value : index}
            className={`number-list-cell clickable border rounded d-flex justify-content-center align-items-center ${
              item && item.state === "true"
                ? "bg-danger text-white"
                : "bg-light text-dark"
            }`}
            onClick={() => item && confirmToggleState(item.value)}
            style={{
              backgroundColor:
                item && item.state === "true"
                  ? colors.secondary
                  : colors.background, // Nền ô 'true' hồng đậm, 'false' trắng ngà
              color: item && item.state === "true" ? "white" : colors.text, // Chữ ô 'true' trắng, 'false' đen nhạt
              borderColor: colors.light, // Viền ô hồng nhạt
            }}
          >
            {formatNumber(item && item.value)}
          </div>
        ))}
      </div>

      {showHistoryModal && (
        <Modal
          show={showHistoryModal}
          onHide={handleCloseHistoryClick}
          style={{ color: colors.text }}
        >
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>
              Lịch Sử Thao Tác
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            <Row className="mb-2" style={{ fontWeight: "bold" }}>
              <Col sm={6} xs={6} style={{ color: colors.secondary }}>
                Thời Gian
              </Col>
              <Col sm={2} xs={2} style={{ color: colors.secondary }}>
                Số
              </Col>
              <Col sm={2} xs={2} style={{ color: colors.secondary }}>
                On/Off
              </Col>
              <Col sm={2} xs={2} style={{ color: colors.secondary }}>
                Action
              </Col>
            </Row>
            {history.map((entry, index) => {
              const parts = entry.split(" | ");
              return (
                <Row key={index} className="mb-1">
                  <Col sm={6} xs={6} style={{ color: colors.text }}>
                    {parts[0]}
                  </Col>
                  <Col sm={2} xs={2} style={{ color: colors.text }}>
                    {parts[1]}
                  </Col>
                  <Col sm={2} xs={2} style={{ color: colors.text }}>
                    <i className={`bi bi-${parts[2]}`}></i>
                  </Col>
                  <Col sm={2} xs={2} style={{ color: colors.text }}>
                    {parts[3]}
                  </Col>
                </Row>
              );
            })}
            {history.length === 0 && (
              <p className="text-center" style={{ color: colors.text }}>
                Chưa có lịch sử thay đổi.
              </p>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button
              variant="primary"
              onClick={handleCloseHistoryClick}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                color: "white",
              }}
            >
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showConfirmModal && (
        <Modal
          show={showConfirmModal}
          onHide={handleCloseConfirmModal}
          style={{ color: colors.text }}
        >
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>
              Xác Nhận Thay Đổi Trạng Thái
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.background }}>
            {numberToToggle && (
              <p style={{ color: colors.text }}>
                Thay đổi trạng thái của số{" "}
                <strong style={{ color: colors.text }}>
                  {formatNumber(numberToToggle.value)}
                </strong>{" "}
                từ{" "}
                <i
                  className={`bi bi-${
                    numberToToggle.state === "true" ? "circle-fill" : "circle"
                  }`}
                ></i>{" "}
                sang{" "}
                <i
                  className={`bi bi-${
                    numberToToggle.state === "true" ? "circle" : "circle-fill"
                  }`}
                ></i>
              </p>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button
              variant="secondary"
              onClick={handleCloseConfirmModal}
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                color: "white",
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmToggle}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                color: "white",
              }}
            >
              Xác Nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showRandomConfirmModal && (
        <Modal
          show={showRandomConfirmModal}
          onHide={handleCloseRandomConfirmModal}
          style={{ color: colors.text }}
        >
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>
              Xác Nhận Quay Số Ngẫu Nhiên
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            Quay số ngẫu nhiên?
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button
              variant="secondary"
              onClick={handleCloseRandomConfirmModal}
              style={{
                backgroundColor: "#6c757d",
                borderColor: "#6c757d",
                color: "white",
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmRandomTrue}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                color: "white",
              }}
            >
              Xác Nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showRandomSuccessModal && (
        <Modal
          show={showRandomSuccessModal}
          onHide={handleCloseRandomSuccessModal}
          style={{ color: colors.text }}
        >
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>
              Tạo Số Thành Công
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            {lastCreatedRandomNumber && (
              <p style={{ color: colors.text }}>
                Đã quay được số:{" "}
                <strong style={{ color: colors.secondary }}>
                  {lastCreatedRandomNumber}
                </strong>
              </p>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button
              variant="primary"
              onClick={handleCloseRandomSuccessModal}
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                color: "white",
              }}
            >
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <AdminPanel
        show={showAdminPanel}
        onResetNumbers={handleResetNumbers}
        onHide={handleCloseAdminPanel}
      />

      {/* Modal xác thực trước khi mở AdminPanel */}
      <Modal show={showAuthModal} onHide={handleCloseAuthModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác thực Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formAuthCode">
              <Form.Label>Nhập mã xác thực:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mã xác thực"
                value={authCode}
                onChange={handleAuthCodeChange}
                isInvalid={!!authError}
              />
              <Form.Control.Feedback type="invalid">
                {authError}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAuthModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleOpenAdminPanel}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NumberList;
