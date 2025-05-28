import React from "react";
import CustomModal from "./CustomModal";
import { useEvents } from "../context/EventsContext";

const GlobalNotificationModal = () => {
  const { notification, hideNotification } = useEvents();

  return (
    <CustomModal
      visible={notification.visible}
      title={notification.title}
      message={notification.message}
      type={notification.type}
      onClose={hideNotification}
      cancelTitle="CLOSE"
    />
  );
};

export default GlobalNotificationModal;
