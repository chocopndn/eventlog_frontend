import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { EventsProvider } from "../context/EventsContext";
import CustomModal from "../components/CustomModal";

function RootLayoutWithModal() {
  const { modalVisible, modalConfig, closeModal } = useAuth();

  return (
    <>
      <Slot />
      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
        cancelTitle="OK"
      />
    </>
  );
}

const RootLayout = () => {
  return (
    <AuthProvider>
      <EventsProvider>
        <RootLayoutWithModal />
      </EventsProvider>
    </AuthProvider>
  );
};

export default RootLayout;
