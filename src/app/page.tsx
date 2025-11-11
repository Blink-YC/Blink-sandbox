import { 
  NavigationHeader,
  HeroSection,
  HowItWorksSection,
  WhyChooseUsSection,
  ForEmployersWorkersSection,
  FooterSection
} from '@/components/landing';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <ForEmployersWorkersSection />
      <FooterSection />
    </div>
  );
}
