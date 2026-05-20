import DashboardLayout from "../layouts/DashboardLayout";
import ChatWindow from "../components/ChatWindow";
import useSessionTracker from "../hooks/useSessionTracker";

function Chatbot() {
  useSessionTracker("Chatbot");

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 py-8 h-full">
        <ChatWindow />
      </div>
    </DashboardLayout>
  );
}

export default Chatbot;