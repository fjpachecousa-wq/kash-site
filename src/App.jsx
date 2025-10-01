import React from "react";
import Hero from "./sections/Hero.jsx";
import Pricing from "./sections/Pricing.jsx";
import HowItWorks from "./sections/HowItWorks.jsx";
import Footer from "./sections/Footer.jsx";

export default function App(){
  return (
    <>
      <Hero />
      <HowItWorks />
      <Pricing />
      <Footer />
    </>
  );
}
