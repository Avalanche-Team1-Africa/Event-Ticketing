import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Hero from "./pages/Hero";
import Discover from "./pages/Discover";
import EventList from "./pages/EventList";
import EventDetails from "./pages/EventDetails";
import TicketPurchase from "./components/TicketPurchase";
import Testimonials from "./pages/Testimonials";
import Chatbit from "./pages/Chatbit";
import Footer from "./components/Footer";
import Qrcode from "./pages/Qrcode";
import Ticketsell from "./pages/Ticketsell"
const App = () => {
  return (
    <Router>
      {/* Chatbit Component - Displayed on all pages */}
      <Chatbit />

      {/* Routing Order */}
      <Routes>
        {/* Hero as Default Page */}
        <Route path="/" element={<Hero />} />

        {/* Testimonials under Hero */}
        <Route path="/testimonials" element={<Testimonials />} />

        {/* Ticketsell under Hero */}
        <Route path="/ticketsell" element={<Ticketsell />} />
        
        {/* Qrcode under Testimonials */}
        <Route path="/qrcode" element={<Qrcode />} />


        {/* Discover under Testimonials */}
        <Route path="/discover" element={<Discover />} />

        {/* Home, EventList, EventDetails remain unchanged */}
        <Route path="/home" element={<Home />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/event/:eventId" element={<EventDetails />} />

        {/* Additional Pages */}
        <Route path="/purchase" element={<TicketPurchase />} />
      </Routes>

      {/* Footer Component - Displayed on all pages */}
      <Footer />
    </Router>
  );
};

export default App;
