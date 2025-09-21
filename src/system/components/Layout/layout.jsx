// Layout.jsx
import Header from "./../Header/header.jsx";
import Footer from "./../Footer/footer.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {

  return (
    <div className="bg-custom-app">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


