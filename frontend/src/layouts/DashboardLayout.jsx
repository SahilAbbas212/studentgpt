import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-5">
        <Navbar />

        <div className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;