import { useState, useEffect } from "react";

const useModal = (initialType = "error") => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState({
    title: "",
    message: "",
    type: initialType,
    buttonText: "Okay",
  });

  const showModal = ({ title, message, type, buttonText = "Okay" }) => {
    setModalDetails({ title, message, type, buttonText });
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  return {
    modalVisible,
    modalDetails,
    showModal,
    hideModal,
  };
};

export default useModal;
