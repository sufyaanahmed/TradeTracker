import React from 'react';
import {
  Header,
  Footer,
  Hero,
  FeatureGrid,
  ContentWithImage,
  StatsSection,
  Button,
  Badge,
  Card,
} from '../palantir';

/**
 * Homepage Mockup
 * 
 * Palantir-inspired homepage showcasing:
 * - Bold hero section
 * - Feature highlights
 * - Social proof (stats)
 * - Product overview
 * - Clear CTAs
 */

export default function PalantirHomepage() {
  // Navigation configuration
  const navItems = [
    { label: 'Product', href: '/product', active: false },
    { label: 'Solutions', href: '/solutions', active: false },
    { label: 'Company', href: '/company', active: false },
    { label: 'Resources', href: '/resources', active: false },
  ];

  // Features data
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Data-Driven Insights',
      description: 'Transform raw data into actionable intelligence with advanced analytics and real-time processing capabilities.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Enterprise Security',
      description: 'Built with security at the core. Role-based access control, end-to-end encryption, and compliance-ready architecture.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Scalable Infrastructure',
      description: 'Cloud-native architecture designed to scale from startups to global enterprises without compromising performance.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: 'Customizable Workflows',
      description: 'Adapt the platform to your unique processes with flexible APIs, custom integrations, and modular components.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Collaborative Tools',
      description: 'Enable teams to work together seamlessly with real-time collaboration, shared workspaces, and version control.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Compliance Ready',
      description: 'Meet regulatory requirements with built-in compliance frameworks, audit trails, and data governance tools.',
    },
  ];

  // Stats data
  const stats = [
    {
      value: '99.99%',
      label: 'Uptime',
      description: 'Enterprise-grade reliability',
    },
    {
      value: '10M+',
      label: 'Data Points',
      description: 'Processed per second',
    },
    {
      value: '500+',
      label: 'Enterprises',
      description: 'Trust our platform',
    },
    {
      value: '<100ms',
      label: 'Response Time',
      description: 'Average query latency',
    },
  ];

  // Footer configuration
  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Security', href: '/security' },
        { label: 'Roadmap', href: '/roadmap' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'Financial Services', href: '/solutions/financial' },
        { label: 'Healthcare', href: '/solutions/healthcare' },
        { label: 'Government', href: '/solutions/government' },
        { label: 'Manufacturing', href: '/solutions/manufacturing' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/api' },
        { label: 'Blog', href: '/blog' },
        { label: 'Case Studies', href: '/case-studies' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Press', href: '/press' },
      ],
    },
  ];

  const footerBottomLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header
        logo="Palrin"
        navItems={navItems}
        ctaButton="Get Started"
      />

      {/* Hero Section */}
      <Hero
        title="Enterprise Intelligence Platform Built for Scale"
        subtitle="Transform complex data into strategic decisions. Palrin combines advanced analytics, real-time processing, and intuitive workflows to empower organizations worldwide."
        primaryCTA="Start Free Trial"
        secondaryCTA="Schedule Demo"
      />

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Feature Grid */}
      <FeatureGrid
        title="Built for Modern Enterprises"
        subtitle="Every feature designed with precision, security, and scalability in mind."
        features={features}
      />

      {/* Product Overview 1 */}
      <ContentWithImage
        title="Real-Time Data Processing"
        content={
          <>
            <p>
              Process millions of data points in real-time with our distributed architecture.
              Built on modern cloud infrastructure, Palrin handles complex queries at scale
              without compromising on speed or accuracy.
            </p>
            <p>
              Advanced caching, intelligent indexing, and optimized data pipelines ensure
              your team has instant access to the insights they need, when they need them.
            </p>
          </>
        }
        imageSrc=""
        imageAlt="Data processing visualization"
        imagePosition="right"
        cta="Learn More"
      />

      {/* Product Overview 2 */}
      <ContentWithImage
        title="Intuitive Analytics Dashboard"
        content={
          <>
            <p>
              Visualize complex data with our purpose-built analytics interface. Create
              custom dashboards, build queries without code, and share insights across
              your organization with a few clicks.
            </p>
            <p>
              From executive overviews to granular operational metrics, Palrin adapts
              to your workflow and presents data in ways that drive action.
            </p>
          </>
        }
        imageSrc=""
        imageAlt="Analytics dashboard"
        imagePosition="left"
        cta="View Demo"
      />

      {/* Use Cases */}
      <section className="section-padding bg-white">
        <div className="container-standard">
          <div className="mb-12 max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold text-neutral-950">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-neutral-600">
              From financial institutions to government agencies, organizations worldwide
              rely on Palrin for mission-critical operations.
            </p>
          </div>

          <div className="grid-3">
            <Card
              badge="Financial Services"
              title="Risk Analysis at Scale"
              description="Real-time fraud detection and risk assessment across millions of transactions daily."
              cta="Read Case Study"
            />
            <Card
              badge="Healthcare"
              title="Patient Data Management"
              description="HIPAA-compliant platform for managing patient records and clinical workflows."
              cta="Read Case Study"
            />
            <Card
              badge="Government"
              title="Secure Intelligence"
              description="Advanced analytics for national security and public safety operations."
              cta="Read Case Study"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-neutral-950 text-white">
        <div className="container-standard text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to Transform Your Data?
          </h2>
          <p className="mb-8 text-xl text-neutral-400">
            Join hundreds of enterprises already using Palrin to drive strategic decisions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-primary text-base px-8 py-3">
              Start Free Trial
            </button>
            <button className="btn-secondary text-base px-8 py-3 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        columns={footerColumns}
        bottomLinks={footerBottomLinks}
      />
    </div>
  );
}
