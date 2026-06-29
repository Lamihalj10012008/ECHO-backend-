import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/MainLayout.css";

function MainLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;