import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReaderModeToolbar from "./components/ReaderModeToolbar";
import { ReaderModeProvider, useReaderMode } from "./context/ReaderModeContext";
import HomePage from "./pages/HomePage";
import TutorialsPage from "./pages/TutorialsPage";
import TopicPage from "./pages/TopicPage";
import DSASheetPage from "./pages/DSASheetPage";
import ProblemResourcePage from "./pages/ProblemResourcePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

function AppShell() {
  const { active } = useReaderMode();

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {!active && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/tutorials/:slug" element={<TopicPage />} />
          <Route path="/tutorials/:slug/:lessonSlug" element={<TopicPage />} />
          <Route path="/dsa-sheet" element={<DSASheetPage />} />
          <Route path="/dsa-sheet/problem/:slug" element={<ProblemResourcePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!active && <Footer />}
      <ReaderModeToolbar />
    </div>
  );
}

function App() {
  return (
    <ReaderModeProvider>
      <AppShell />
    </ReaderModeProvider>
  );
}

export default App;
