import { Hero } from "@/components/sections/Hero";
import { FeaturedCabins } from "@/components/sections/FeaturedCabins";
import { Experience } from "@/components/sections/Experience";
import { AtmosphereGrid } from "@/components/sections/AtmosphereGrid";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCabins />
      <Experience />
      <AtmosphereGrid />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
