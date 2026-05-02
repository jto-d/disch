import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./styles.css";

import { Root } from "./routes/Root";
import { EntryRoute } from "./routes/Entry";
import { FeedRoute } from "./routes/Feed";
import { MarketDetailRoute } from "./routes/MarketDetail";
import { AdminGate } from "./routes/AdminGate";
import { AdminLayout } from "./routes/AdminLayout";
import { AdminAttendees } from "./routes/AdminAttendees";
import { AdminMarkets } from "./routes/AdminMarkets";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000,
      refetchOnWindowFocus: true,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <EntryRoute /> },
      { path: "/feed", element: <FeedRoute /> },
      { path: "/market/:id", element: <MarketDetailRoute /> },
      { path: "/admin", element: <AdminGate /> },
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/attendees", element: <AdminAttendees /> },
          { path: "/admin/markets", element: <AdminMarkets /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
