import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}