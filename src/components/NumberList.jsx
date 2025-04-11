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
    if (percentage >= 0 && percentage <= 30) {
      return "danger";
    } else if (percentage >= 31 && percentage <= 60) {
      return "warning";
    } else if (percentage >= 61 && percentage <= 100) {
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
    const timestamp = new Date().toLocaleTimeString();
    const message = `Số ${formattedValue}: ${oldState.toUpperCase()} -> ${newState.toUpperCase()}`;
    setHistory((prevHistory) => [...prevHistory, `${timestamp} - ${message}`]);
  };

  const toggleState = (value) => {
    setNumbers((prevNumbers) => {
      return prevNumbers.map((number) => {
        if (number && number.value === value) {
          const oldState = number.state;
          const newState = number.state === "true" ? "false" : "true";
          logHistory(value, oldState, newState);
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
            logHistory(randomNumberToUpdate, number.state, "true");
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
      setNextState(number.state === "true" ? "FALSE" : "TRUE");
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
    <div className="container">
      <div ref={headerRef} className="bg-light shadow-sm" style={{ width: "100%", zIndex: 1000, position: 'sticky', top: 0 }}>
        <div className="button-container p-2">
          <button onClick={createRandomTrue} className="btn btn-primary">
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
              SAVING MONEY
            </span>
          </div>
          <button
            onClick={handleShowHistoryClick}
            className="btn btn-info"
            style={{
              width: "auto",
              minWidth: "0",
              backgroundColor: "#007bff",
              borderColor: "#007bff",
            }}
          >
            <span className="d-none d-md-inline-block">
              &nbsp;&nbsp;XEM LỊCH SỬ&nbsp;&nbsp;
            </span>
            <span className="d-inline-block d-md-none" aria-hidden="true">
              <i className="bi bi-clock-history"></i>
            </span>
          </button>
        </div>

        <Row className="mb-3 align-items-center justify-content-between p-2">
          <Col
            xs={12}
            md="auto"
            className="mb-2 mb-md-0 text-md-left text-center goal-for-container"
          >
            <i className="bi bi-flag mr-2" style={{ color: "#777" }}></i>
            <span>&nbsp;Goal for 2025:</span>{" "}
            <strong className="ml-1">{formatCurrency(totalSum)}</strong>
          </Col>
          <Col xs={12} md="auto" className="mb-2 mb-md-0 text-center">
            {" "}
            {/* Giữ căn giữa cho "Current" */}
            <i className="bi bi-wallet mr-2" style={{ color: "green" }}></i>
            <span>&nbsp;Current:</span>{" "}
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
            {/* Căn phải */}
            <span className="mr-2 d-none d-md-inline">Progress:&nbsp;</span>
            <ProgressBar
              animated
              now={parseFloat(completionPercentage)}
              label={`${completionPercentage}%`}
              variant={getProgressBarVariant(parseFloat(completionPercentage))}
              style={{ width: "100%", minWidth: "150px", marginTop: "0" }}
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
          >
            {formatNumber(item && item.value)}
          </div>
        ))}
      </div>

      {showHistoryModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lịch Sử Thay Đổi Trạng Thái</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseHistoryClick}
                ></button>
              </div>
              <div className="modal-body">
                <ul className="mb-0">
                  {history.map((entry, index) => (
                    <li key={index}>{entry}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={handleCloseHistoryClick}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHistoryModal && <div className="modal-backdrop fade show"></div>}

      {showConfirmModal && (
        <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
          <Modal.Header closeButton>
            <Modal.Title>Xác Nhận Thay Đổi Trạng Thái</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {numberToToggle && (
              <p>
                Bạn có chắc chắn muốn thay đổi trạng thái của số{" "}
                <strong>{formatNumber(numberToToggle.value)}</strong> từ{" "}
                <strong>{numberToToggle.state.toUpperCase()}</strong> sang{" "}
                <strong>{nextState}</strong> không?
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseConfirmModal}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmToggle}>
              Xác Nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showRandomConfirmModal && (
        <Modal
          show={showRandomConfirmModal}
          onHide={handleCloseRandomConfirmModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác Nhận Tạo Số Ngẫu Nhiên</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn tạo một số ngẫu nhiên có trạng thái TRUE không?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseRandomConfirmModal}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmRandomTrue}>
              Xác Nhận
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showRandomSuccessModal && (
        <Modal
          show={showRandomSuccessModal}
          onHide={handleCloseRandomSuccessModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Tạo Số Thành Công</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {lastCreatedRandomNumber && (
              <p>
                Đã tạo thành công số: <strong>{lastCreatedRandomNumber}</strong>
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseRandomSuccessModal}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default NumberList;