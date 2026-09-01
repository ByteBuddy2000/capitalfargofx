'use client';

import { useState } from 'react';
import { AboutSection } from '@/components/landing/AboutSection';
import { AlternativeInvestments } from '@/components/landing/AlternativeInvestments';
import { CryptoAssets } from '@/components/landing/CryptoAssets';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { InvestmentCategories } from '@/components/landing/InvestmentCategories';
import { Navbar } from '@/components/landing/Navbar';
import { PlansSection } from '@/components/landing/PlansSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { TrustStats } from '@/components/landing/TrustStats';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { ToastProvider } from '@/components/ui/Toast';
import { LegalModal, type LegalDocType } from '@/components/legal/LegalModal';
import { storage } from '@/lib/storage';
import type { User } from '@/types';

export default function HomePage() {
  const [currentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [plans] = useState(() => storage.getPlans());
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('terms');
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigate = (path: string) => {
    window.location.assign(path);
  };

  const openLegal = (type: LegalDocType) => {
    setLegalDocType(type);
    setLegalModalOpen(true);
  };

  const openRegister = () => navigate('/register');
  const openLogin = () => navigate('/login');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Navbar
          currentUser={currentUser}
          onOpenAuth={(mode) => navigate(`/${mode}`)}
          onNavigateDashboard={() => navigate('/dashboard')}
          onNavigateAdmin={() => navigate('/admin')}
          onNavigateSection={scrollTo}
        />

        <main className="flex-1">
          <Hero onOpenRegister={openRegister} onExplorePlans={() => scrollTo('plans')} />
          <TrustStats settings={storage.getSettings()} />
          <AboutSection onOpenRegister={openRegister} />
          <WhyChooseUs />
          <InvestmentCategories onSelectCategory={() => scrollTo('plans')} />
          <PlansSection plans={plans} onSelectPlan={setPreselectedPlan} />
          <HowItWorks />
          <CryptoAssets wallets={storage.getWallets()} />
          <AlternativeInvestments onOpenRegister={openRegister} />
          <TestimonialsSection testimonials={storage.getTestimonials()} />
          <FaqSection faqs={storage.getFaqs()} />
          <FinalCta onOpenRegister={openRegister} onOpenLogin={openLogin} />
        </main>

        <Footer
          settings={storage.getSettings()}
          onNavigateSection={scrollTo}
          onOpenLegal={openLegal}
          onOpenAuth={(mode) => navigate(`/${mode}`)}
        />

        <LegalModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialDocType={legalDocType}
        />
      </div>
    </ToastProvider>
  );
}