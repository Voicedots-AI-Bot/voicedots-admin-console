import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminLogin } from "@/pages/AdminLogin";
import { DashboardPage } from "@/pages/DashboardPage";
import { BlogsManagerPage } from "@/pages/BlogsManagerPage";
import { BlogEditorPage } from "@/pages/BlogEditorPage";
import { MessagesPage } from "@/pages/MessagesPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="voicedots-admin-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />

            <Route path="/" element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route index element={<DashboardPage />} />
              <Route path="blogs" element={<BlogsManagerPage />} />
              <Route path="blogs/:id" element={<BlogEditorPage />} />
              <Route path="messages" element={<MessagesPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
