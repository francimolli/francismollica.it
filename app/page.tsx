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

export default function Home() {
  return (
    <CityControlsProvider>
      <FloatingSectionProvider>
        <Layout>
          <Header />
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
        </Layout>
      </FloatingSectionProvider>
    </CityControlsProvider>
  );
}
