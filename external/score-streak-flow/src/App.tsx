import { Toaster } from "@root/components/ui/toaster";
import { Toaster as Sonner } from "@root/components/ui/sonner";
import { TooltipProvider } from "@root/components/ui/tooltip";
import ThemeProvider from "@root/components/layout/ThemeToggle/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServiceWorkerToasts from "./pwa/ServiceWorkerToasts";
import InstallPrompt from "./pwa/InstallPrompt";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<ServiceWorkerToasts />
				<InstallPrompt />
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Index />} />
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</ThemeProvider>
	</QueryClientProvider>
);

export default App;
