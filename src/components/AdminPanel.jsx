// AdminPanel.jsx (thêm input cho year)
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

function AdminPanel({ show, onHide, onResetNumbers }) {
  const [minNumber, setMinNumber] = useState("");
  const [maxNumber, setMaxNumber] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [minError, setMinError] = useState("");
  const [maxError, setMaxError] = useState("");
  const [yearError, setYearError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleMinNumberChange = (event) => {
    const value = event.target.value;
    setMinNumber(value);
    setMinError("");
  };

  const handleMaxNumberChange = (event) => {
    const value = event.target.value;
    setMaxNumber(value);
    setMaxError("");
  };

  const handleYearInputChange = (event) => {
    setYearInput(event.target.value);
    setYearError("");
  };

  const handleShowConfirm = () => {
    const min = parseInt(minNumber, 10);
    const max = parseInt(maxNumber, 10);
    const year = parseInt(yearInput, 10);
    let hasError = false;
    let message = "";

    if (isNaN(min) || min < 1) {
      setMinError("Số nhỏ nhất phải lớn hơn hoặc bằng 1.");
      hasError = true;
      message = "Vui lòng nhập số nhỏ nhất lớn hơn hoặc bằng 1.";
    } else {
      setMinError("");
    }

    if (isNaN(max) || max < min) {
      setMaxError("Số lớn nhất phải lớn hơn hoặc bằng số nhỏ nhất.");
      hasError = true;
      if (!message) {
        message = "Vui lòng nhập số lớn nhất lớn hơn hoặc bằng số nhỏ nhất.";
      } else {
        message += "\nVà số lớn nhất phải lớn hơn hoặc bằng số nhỏ nhất.";
      }
    } else {
      setMaxError("");
    }

    if (isNaN(year)) {
      setYearError("Vui lòng nhập năm.");
      hasError = true;
      if (!message) {
        message = "Vui lòng nhập năm.";
      } else {
        message += "\nVà vui lòng nhập năm.";
      }
    } else {
      setYearError("");
    }

    if (hasError) {
      setErrorMessage(message);
      setShowErrorModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleResetButtonClick = () => {
    const min = parseInt(minNumber, 10);
    const max = parseInt(maxNumber, 10);
    const year = parseInt(yearInput, 10);

    const newNumbers = [];
    for (let i = min; i <= max; i++) {
      newNumbers.push({ value: i, state: "false" });
    }

    onResetNumbers(newNumbers, [], year); // Truyền year về component cha
    setMinNumber("");
    setMaxNumber("");
    setYearInput("");
    setShowConfirmModal(false); // Đóng modal xác nhận
    onHide(); // Đóng modal tạo số
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Admin Panel - Tạo lại bảng số</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formMinNumber">
              <Form.Label>Số nhỏ nhất:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập số nhỏ nhất (>= 1)"
                value={minNumber}
                onChange={handleMinNumberChange}
                isInvalid={!!minError}
              />
              <Form.Control.Feedback type="invalid">{minError}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMaxNumber">
              <Form.Label>Số lớn nhất:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập số lớn nhất (>= số nhỏ nhất)"
                value={maxNumber}
                onChange={handleMaxNumberChange}
                isInvalid={!!maxError}
              />
              <Form.Control.Feedback type="invalid">{maxError}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formYear">
              <Form.Label>Năm:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập năm"
                value={yearInput}
                onChange={handleYearInputChange}
                isInvalid={!!yearError}
              />
              <Form.Control.Feedback type="invalid">{yearError}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleShowConfirm}>
            Tạo lại bảng số
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thông báo lỗi */}
      <Modal show={showErrorModal} onHide={handleCloseErrorModal}>
        <Modal.Header closeButton>
          <Modal.Title>Lỗi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{errorMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleCloseErrorModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận */}
      <Modal show={showConfirmModal} onHide={handleCloseConfirmModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn tạo lại bảng số cho năm {yearInput} với dãy số từ {minNumber} đến {maxNumber} không?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmModal}>
            Không
          </Button>
          <Button variant="primary" onClick={handleResetButtonClick}>
            Có
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminPanel;