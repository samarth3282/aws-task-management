import { useLenis } from "../hooks/useLenis.js";

import Nav from "../components/landing/Nav.jsx";
import Hero from "../components/landing/Hero.jsx";
import InfraStrip from "../components/landing/InfraStrip.jsx";
import FeatureShowcase from "../components/landing/FeatureShowcase.jsx";
import Workflow from "../components/landing/Workflow.jsx";
import Pricing from "../components/landing/Pricing.jsx";
import CTA from "../components/landing/CTA.jsx";
import Footer from "../components/landing/Footer.jsx";

export default function LandingPage() {
  useLenis(true);

  return (
    <div className="landing">
      <Nav />
      <main>
        <Hero />
        <FeatureShowcase />
        <InfraStrip />
        <Workflow />
        {/* <Pricing /> */}
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
