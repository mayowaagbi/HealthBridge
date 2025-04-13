import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../hooks/sockets";
import { jwtDecode } from "jwt-decode";
import { registerSocket } from "../hooks/sockets";
interface Request {
  id: string;
  userId: string;
  address: string;
  createdAt: string;
}

const ProviderWebSocketHandler = () => {
  const { isLoggedIn, userRole, accessToken } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    const testButton = document.createElement("button");
    testButton.textContent = "Test Socket";
    testButton.style.position = "fixed";
    testButton.style.bottom = "10px";
    testButton.style.right = "10px";
    testButton.style.zIndex = "9999";

    const handleTestClick = () => {
      if (socket.connected) {
        socket.emit("test-event", { message: "Testing from client" });
        toast.info("Test event sent to server");
      } else {
        toast.error("Socket not connected");
      }
    };

    testButton.addEventListener("click", handleTestClick);
    document.body.appendChild(testButton);

    return () => {
      testButton.removeEventListener("click", handleTestClick);
      document.body.removeChild(testButton);
    };
  }, [socket]);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "PROVIDER" || !accessToken) return;

    const decodedToken = jwtDecode<{ id: string }>(accessToken);
    registerSocket("PROVIDER", decodedToken.id);

    const handleNewRequest = (request: Request) => {
      toast.info(
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">
            New Ambulance Request
          </h3>
          <p className="mt-1 text-sm text-gray-600">{request.address}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              From: {request.userId}
            </span>
            <span className="text-xs text-gray-500">
              At: {new Date(request.createdAt).toLocaleString()}
            </span>
          </div>
        </div>,
        { autoClose: 10000 }
      );
    };

    socket.on("new-ambulance-request", handleNewRequest);

    return () => {
      socket.off("new-ambulance-request", handleNewRequest);
    };
  }, [isLoggedIn, userRole, accessToken, socket]);

  return (
    <div>
      <ToastContainer
        position="bottom-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ProviderWebSocketHandler;
