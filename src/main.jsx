import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ProgressProvider } from "./context/ProgressContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <OnboardingProvider>
      <ProgressProvider>
        <AppRoutes />
      </ProgressProvider>
    </OnboardingProvider>
  </BrowserRouter>
);