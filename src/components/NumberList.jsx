import React, { useState, useEffect, useRef } from "react";
import "../styles/NumberList.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Modal, Button } from "react-bootstrap";
import { Row, Col, ProgressBar } from "react-bootstrap";

function NumberList() {
  const [numbers, setNumbers] = useState([]);
  const [history, setHistory] = useState([]);
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
    primary: '#FF8195',   // Hồng tươi
    secondary: '#F9476C', // Hồng đậm
    background: '#FAF2E8', // Trắng ngà
    text: '#333',        // Đen nhạt
    light: '#FDD5C8',    // Hồng nhạt
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
        body: JSON.stringify({ numbers, history }),
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
  }, [numbers, history]);

  const formatNumber = (number) => {
    return number ? number.toString().padStart(3, "0") : "---";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const logHistory = (value, oldState, newState) => {
    const formattedValue = formatNumber(value);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const timestamp = `${date} ${time}`;
    const message = `Số ${formattedValue} | ${oldState.toUpperCase()} -> ${newState.toUpperCase()}`;
    setHistory((prevHistory) => [...prevHistory, `${timestamp} | ${message}`]);
  };

  const toggleState = (value) => {
    setNumbers((prevNumbers) => {
      return prevNumbers.map((number) => {
        if (number && number.value === value) {
          const oldState = number.state;
          const newState = number.state === "true" ? "false" : "true";
          logHistory(value, oldState === "true" ? "BẬT" : "TẮT", newState === "true" ? "BẬT" : "TẮT");
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
            logHistory(randomNumberToUpdate, "TẮT", "BẬT");
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
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  if (loading) {
    return <div className="text-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-danger">Lỗi tải dữ liệu: {error}</div>
    );
  }

  return (
    <div className="container" style={{ backgroundColor: colors.background, minHeight: '100vh', paddingBottom: '50px' }}>
      <div
        ref={headerRef}
        className="bg-light shadow-sm"
        style={{
          width: "100%",
          zIndex: 1000,
          position: 'sticky',
          top: 0,
          backgroundColor: colors.light, // Nền header hồng nhạt
        }}
      >
        <div className="button-container p-2" style={{ backgroundColor: colors.light }}> {/* Nền button-container hồng nhạt */}
          <button onClick={createRandomTrue} className="btn btn-primary" style={{ backgroundColor: colors.primary, borderColor: colors.primary }}>
            <span className="d-none d-md-inline-block">TẠO NGẪU NHIÊN</span>
            <span className="d-inline-block d-md-none" aria-hidden="true">
              <i className="bi bi-plus-circle"></i>
            </span>
          </button>
          <div className="logo-container">
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
              <span style={{ color: colors.secondary }}>SAVING MONEY</span> {/* Màu chữ logo hồng đậm */}
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
            <span className="d-none d-md-inline-block" style={{ color: 'white' }}>
              &nbsp;&nbsp;XEM LỊCH SỬ&nbsp;&nbsp;
            </span>
            <span className="d-inline-block d-md-none" aria-hidden="true" style={{ color: 'white' }}>
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
            <i className="bi bi-flag mr-2" style={{ color: colors.secondary }}></i> {/* Icon mục tiêu hồng đậm */}
            <span>Goal for 2025:&nbsp;</span>
            <strong className="ml-1" style={{ color: colors.primary }}>{formatCurrency(totalSum)}</strong> {/* Số mục tiêu hồng tươi */}
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
            <i className="bi bi-graph-up-arrow mr-2 d-none d-md-inline" style={{ color: colors.secondary }}></i>
            <span className="mr-2 d-none d-md-inline" style={{ color: colors.text }}>&nbsp;Progress:&nbsp;</span> {/* Chữ Progress đen nhạt */}
            <ProgressBar
              animated
              now={parseFloat(completionPercentage)}
              label={`${completionPercentage}%`}
              variant={getProgressBarVariant(parseFloat(completionPercentage))}
              style={{ width: "100%", minWidth: "150px", marginTop: "0", backgroundColor: colors.light, borderColor: colors.light }} // Nền progress bar hồng nhạt
            />
          </Col>
        </Row>
      </div>

      <div className="number-grid mt-3" style={{ padding: '1px' }}>
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
              backgroundColor: item && item.state === "true" ? colors.secondary : colors.background, // Nền ô 'true' hồng đậm, 'false' trắng ngà
              color: item && item.state === "true" ? 'white' : colors.text, // Chữ ô 'true' trắng, 'false' đen nhạt
              borderColor: colors.light, // Viền ô hồng nhạt
            }}
          >
            {formatNumber(item && item.value)}
          </div>
        ))}
      </div>

      {showHistoryModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content" style={{ backgroundColor: colors.background, color: colors.text }}>
              <div className="modal-header" style={{ backgroundColor: colors.light }}>
                <h5 className="modal-title" style={{ color: colors.text }}>Lịch Sử Thay Đổi Trạng Thái</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseHistoryClick}
                  style={{ backgroundColor: colors.text, opacity: 0.5 }}
                ></button>
              </div>
              <div className="modal-body">
                <Row className="mb-2" style={{ fontWeight: 'bold' }}>
                  <Col md={5} style={{ color: colors.secondary }}>Thời Gian</Col>
                  <Col md={3} style={{ color: colors.secondary }}>Số</Col>
                  <Col md={4} style={{ color: colors.secondary }}>Thông Tin</Col>
                </Row>
                {history.map((entry, index) => {
                  const parts = entry.split(' | ');
                  return (
                    <Row key={index} className="mb-1">
                      <Col md={5} style={{ color: colors.text }}>{parts[0]}</Col>
                      <Col md={3} style={{ color: colors.text }}>{parts[1]}</Col>
                      <Col md={4} style={{ color: colors.text }}>{parts[2]}</Col>
                    </Row>
                  );
                })}
                {history.length === 0 && (
                  <p className="text-center" style={{ color: colors.text }}>Chưa có lịch sử thay đổi.</p>
                )}
              </div>
              <div className="modal-footer" style={{ backgroundColor: colors.light }}>
                <Button variant="secondary" onClick={handleCloseHistoryClick} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', color: 'white' }}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHistoryModal && <div className="modal-backdrop fade show"></div>}

      {showConfirmModal && (
        <Modal show={showConfirmModal} onHide={handleCloseConfirmModal} style={{ color: colors.text }}>
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>Xác Nhận Thay Đổi Trạng Thái</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.background }}>
            {numberToToggle && (
              <p style={{ color: colors.text }}>
                Thay đổi trạng thái của số{" "}
                <strong style={{ color: colors.primary }}>{formatNumber(numberToToggle.value)}</strong> từ{" "}
                <strong style={{ color: colors.secondary }}>{numberToToggle.state==="true"?"BẬT":"TẮT"}</strong> sang{" "}
                <strong style={{ color: colors.primary }}>{nextState}</strong>
              </p>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button variant="secondary" onClick={handleCloseConfirmModal} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', color: 'white' }}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmToggle} style={{ backgroundColor: colors.primary, borderColor: colors.primary, color: 'white' }}>
              Xác Nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showRandomConfirmModal && (
        <Modal show={showRandomConfirmModal} onHide={handleCloseRandomConfirmModal} style={{ color: colors.text }}>
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>Xác Nhận Quay Số Ngẫu Nhiên</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.background, color: colors.text }}>
            Quay số ngẫu nhiên?
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button variant="secondary" onClick={handleCloseRandomConfirmModal} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', color: 'white' }}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmRandomTrue} style={{ backgroundColor: colors.primary, borderColor: colors.primary, color: 'white' }}>
              Xác Nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showRandomSuccessModal && (
        <Modal show={showRandomSuccessModal} onHide={handleCloseRandomSuccessModal} style={{ color: colors.text }}>
          <Modal.Header closeButton style={{ backgroundColor: colors.light }}>
            <Modal.Title style={{ color: colors.text }}>Tạo Số Thành Công</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: colors.background, color: colors.text }}>
            {lastCreatedRandomNumber && (
              <p style={{ color: colors.text }}>
                Đã quay được số: <strong style={{ color: colors.secondary }}>{lastCreatedRandomNumber}</strong>
              </p>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: colors.light }}>
            <Button variant="primary" onClick={handleCloseRandomSuccessModal} style={{ backgroundColor: colors.primary, borderColor: colors.primary, color: 'white' }}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default NumberList;