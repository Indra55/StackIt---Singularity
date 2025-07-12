
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext"; 
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Messages from "./pages/Messages";
import MessageThread from "./pages/MessageThread";
import ExpertConnections from "./pages/ExpertConnections";
import CommunityDiscussions from "./pages/CommunityDiscussions";
import UserSettings from "./pages/UserSettings";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import CommunityDiscussionThread from "./pages/CommunityDiscussionThread";
import Communities from "./pages/Communities";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminCommunities from "./pages/admin/AdminCommunities";
import AdminCommunityDetail from "./pages/admin/AdminCommunityDetail";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminComments from "./pages/admin/AdminComments";
import AdminMetrics from "./pages/admin/AdminMetrics";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />
                <Route path="/ask" element={<AskQuestion />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversationId" element={<MessageThread />} />
                <Route path="/messages/experts" element={<ExpertConnections />} />
                <Route path="/messages/community" element={<CommunityDiscussions />} />
                <Route path="/messages/community/:id" element={<CommunityDiscussionThread />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/user/:username" element={<UserProfile />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                
                {/* Admin Routes - Protected by admin role */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUserDetail />
                  </ProtectedRoute>
                } />
                <Route path="/admin/communities" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCommunities />
                  </ProtectedRoute>
                } />
                <Route path="/admin/communities/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCommunityDetail />
                  </ProtectedRoute>
                } />
                <Route path="/admin/posts" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPosts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/comments" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminComments />
                  </ProtectedRoute>
                } />
                <Route path="/admin/metrics" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminMetrics />
                  </ProtectedRoute>
                } />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
