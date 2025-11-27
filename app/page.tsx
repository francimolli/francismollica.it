"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import SectionCard from "@/components/SectionCard";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Music } from "@/components/Music";
import { CityControlsProvider } from "@/components/CityControlsContext";
import { FloatingSectionProvider } from "@/components/FloatingSectionContext";
import { LogbookMenu } from "@/components/LogbookMenu";
import { OnboardingTerminal } from "@/components/OnboardingTerminal";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

export default function Home() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [mode, setMode] = useState<"immersive" | "classic">("immersive");
  const { language } = useLanguage();
  const t = translations[language];

  const handleOnboardingComplete = (selectedMode: "immersive" | "classic") => {
    setMode(selectedMode);
    setOnboardingComplete(true);
  };

  if (!onboardingComplete) {
    return <OnboardingTerminal onComplete={handleOnboardingComplete} />;
  }

  if (mode === "classic") {
    return (
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

          <section id="projects" className="pt-8 border-t border-gray-900">
            <h2 className="text-2xl font-bold mb-6 text-cyan-500">Projects</h2>
            <Projects />
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
    );
  }

  return (
    <CityControlsProvider>
      <FloatingSectionProvider>
        <Layout>
          <Header />
          <LogbookMenu />
          <SectionCard id="home" title="Home">
            <Hero />
          </SectionCard>
          <SectionCard id="about" title="Who am I?">
            <About />
          </SectionCard>
          <SectionCard id="projects" title="Projects">
            <Projects />
          </SectionCard>
          <SectionCard id="contact" title="Contact">
            <Contact />
          </SectionCard>
          <SectionCard id="music" title="Music">
            <Music />
          </SectionCard>
          <SectionCard id="roadmap" title="Roadmap">
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 p-8">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                <span className="text-3xl">🚧</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-500 font-mono mb-2 tracking-widest">{(t as any).roadmap?.title || "COMING SOON"}</h2>
                <p className="text-gray-400 max-w-md mx-auto font-mono text-sm md:text-base">
                  {(t as any).roadmap?.description || "Trajectory calculation in progress..."}
                </p>
              </div>
            </div>
          </SectionCard>
        </Layout>
      </FloatingSectionProvider>
    </CityControlsProvider>
  );
}
