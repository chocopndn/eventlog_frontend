import { useState, useEffect } from "react";

const useModal = (initialType = "error") => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState({
    title: "",
    message: "",
    type: initialType,
  });

  const showModal = ({ title, message, type }) => {
    setModalDetails({ title, message, type });
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (!modalVisible) {
      setModalDetails((prev) => ({ ...prev, type: initialType }));
    }
  }, [modalVisible, initialType]);

  return {
    modalVisible,
    modalDetails,
    showModal,
    hideModal,
  };
};

export default useModal;
