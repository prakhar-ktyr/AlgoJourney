import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import TutorialsPage from "./pages/TutorialsPage";
import TopicPage from "./pages/TopicPage";
import DSASheetPage from "./pages/DSASheetPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/tutorials/:slug" element={<TopicPage />} />
          <Route path="/dsa-sheet" element={<DSASheetPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
