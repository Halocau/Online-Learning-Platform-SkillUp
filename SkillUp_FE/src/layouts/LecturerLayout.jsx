import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { decodeToken } from "@/lib/auth-utils.js";
import LecturerSidebar from "@/components/Layout/LecturerSidebar.jsx";
import LecturerTopbar from "@/components/Layout/LecturerTopbar.jsx";

function LecturerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    if (accessToken) {
      const decoded = decodeToken(accessToken);
      const status = decoded?.status || decoded?.Status;
      setIsPending(status === "Pending");
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <LecturerSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isPending={isPending}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <LecturerTopbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LecturerLayout;
