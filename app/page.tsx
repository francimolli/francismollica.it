"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import SectionCard from "@/components/SectionCard";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { Portfolio } from "@/components/Portfolio";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Music } from "@/components/Music";
import { MarketArt } from "@/components/MarketArt";
import { Construction } from "lucide-react";
import { CityControlsProvider } from "@/components/CityControlsContext";
import { FloatingSectionProvider } from "@/components/FloatingSectionContext";
import { UniverseColorProvider } from "@/components/UniverseColorContext";
import { LogbookMenu } from "@/components/LogbookMenu";
import { VisualModeSwitch } from "@/components/VisualModeSwitch";
import { OnboardingTerminal } from "@/components/OnboardingTerminal";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

export default function Home() {
  const { onboardingComplete, setOnboardingComplete, language } = useLanguage();
  const [mode, setMode] = useState<"immersive" | "classic" | "technical" | "uplink" | "projects">("immersive");
  const t = translations[language];

  const handleOnboardingComplete = (selectedMode: "immersive" | "classic" | "technical" | "uplink" | "projects") => {
    setMode(selectedMode);
    setOnboardingComplete(true);
  };

  const finalMode = (mode === "technical" || mode === "uplink" || mode === "projects") ? "immersive" : mode;

  return (
    <UniverseColorProvider>
    <>
      {!onboardingComplete && (
        <div className="fixed inset-0 z-[100]">
          <OnboardingTerminal onComplete={handleOnboardingComplete} />
        </div>
      )}

      {/* Main Content: Always in DOM for SEO */}
      <div className={!onboardingComplete ? "h-screen overflow-hidden opacity-0 pointer-events-none" : ""}>
        {finalMode === "classic" ? (
          <main className="min-h-screen bg-black text-white p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-12">
              <header className="py-8 border-b border-gray-800 mb-8">
                <h1 className="text-3xl font-bold text-white">Francesco Mollica</h1>
                <p className="text-gray-400">Full Stack Engineer</p>
              </header>

              <section id="home">
                <Hero />
              </section>

              <section id="about" className="pt-8 border-t border-gray-900">
                <h2 className="text-2xl font-bold mb-6 text-cyan-500">About</h2>
                <About />
              </section>

              <section id="timeline" className="pt-8 border-t border-gray-900">
                <h2 className="text-2xl font-bold mb-6 text-cyan-500">{(t as any).projects.sectionTitle}</h2>
                <Projects />
              </section>

              <section id="portfolio" className="pt-8 border-t border-gray-900">
                <h2 className="text-2xl font-bold mb-6 text-cyan-500">{(t as any).portfolio.sectionTitle}</h2>
                <Portfolio />
              </section>

              <section id="music" className="pt-8 border-t border-gray-900">
                <h2 className="text-2xl font-bold mb-6 text-cyan-500">Music</h2>
                <Music />
              </section>

              <section id="contact" className="pt-8 border-t border-gray-900">
                <h2 className="text-2xl font-bold mb-6 text-cyan-500">Contact</h2>
                <Contact />
              </section>
            </div>
          </main>
        ) : (
          <CityControlsProvider>
            <FloatingSectionProvider>
              <Layout>
                <Header />
                <LogbookMenu />
                <VisualModeSwitch />
                <SectionCard id="home" title="Home">
                  <Hero />
                </SectionCard>
                <SectionCard id="about" title="Who am I?">
                  <About />
                </SectionCard>
                <SectionCard id="timeline" title={(t as any).projects.sectionTitle}>
                  <Projects />
                </SectionCard>
                <SectionCard id="portfolio" title={(t as any).portfolio.sectionTitle}>
                  <Portfolio />
                </SectionCard>
                <SectionCard id="contact" title="Contact">
                  <Contact />
                </SectionCard>
                <SectionCard id="music" title="Music">
                  <Music />
                </SectionCard>
                <SectionCard id="market" title={(t as any).nav.market}>
                  <MarketArt />
                </SectionCard>
                <SectionCard id="roadmap" title="Roadmap">
                  <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 p-8">
                    <div className="w-20 h-20 rounded-3xl bg-u-sun/10 border-2 border-u-sun/50 flex items-center justify-center shadow-[0_0_30px_rgba(255,217,138,0.2)]">
                      <Construction className="w-9 h-9 text-u-sun" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-u-sun mb-2 tracking-widest">{(t as any).roadmap?.title || "COMING SOON"}</h2>
                      <p className="text-u-lilac/70 max-w-md mx-auto text-sm md:text-base">
                        {(t as any).roadmap?.description || "Trajectory calculation in progress..."}
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </Layout>
            </FloatingSectionProvider>
          </CityControlsProvider>
        )}
      </div>
    </>
    </UniverseColorProvider>
  );
}
