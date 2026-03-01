import React from 'react';
import {
  Header,
  Footer,
  Section,
  PageContainer,
  Button,
  Badge,
  StatusIndicator,
  DataTable,
} from '../index';

/**
 * Product/Feature Page Mockup
 * 
 * Detailed product feature page with:
 * - Feature overview
 * - Technical specifications
 * - Comparison table
 * - Integration details
 * - Pricing tiers
 */

export default function ProductPage() {
  const navItems = [
    { label: 'Product', href: '/product', active: true },
    { label: 'Solutions', href: '/solutions', active: false },
    { label: 'Company', href: '/company', active: false },
    { label: 'Resources', href: '/resources', active: false },
  ];

  // Technical specifications
  const specs = [
    { label: 'Query Performance', value: '<100ms', status: 'success' },
    { label: 'Data Throughput', value: '10M+ records/sec', status: 'success' },
    { label: 'Availability SLA', value: '99.99%', status: 'success' },
    { label: 'Storage Limit', value: 'Unlimited', status: 'success' },
    { label: 'API Rate Limit', value: '1000 req/sec', status: 'info' },
  ];

  // Feature comparison table
  const comparisonColumns = [
    { label: 'Feature', key: 'feature' },
    { 
      label: 'Starter', 
      key: 'starter',
      render: (row) => row.starter ? '✓' : '—'
    },
    { 
      label: 'Professional', 
      key: 'professional',
      render: (row) => row.professional ? '✓' : '—'
    },
    { 
      label: 'Enterprise', 
      key: 'enterprise',
      render: (row) => row.enterprise ? '✓' : '—'
    },
  ];

  const comparisonData = [
    { feature: 'Real-time Analytics', starter: true, professional: true, enterprise: true },
    { feature: 'Custom Dashboards', starter: true, professional: true, enterprise: true },
    { feature: 'API Access', starter: true, professional: true, enterprise: true },
    { feature: 'Advanced Security', starter: false, professional: true, enterprise: true },
    { feature: 'SSO Integration', starter: false, professional: true, enterprise: true },
    { feature: 'White Labeling', starter: false, professional: false, enterprise: true },
    { feature: 'Dedicated Support', starter: false, professional: false, enterprise: true },
    { feature: 'Custom SLA', starter: false, professional: false, enterprise: true },
  ];

  // Integration partners
  const integrations = [
    { name: 'Salesforce', category: 'CRM' },
    { name: 'Slack', category: 'Communication' },
    { name: 'AWS', category: 'Infrastructure' },
    { name: 'Snowflake', category: 'Data Warehouse' },
    { name: 'Tableau', category: 'Visualization' },
    { name: 'Kubernetes', category: 'Orchestration' },
  ];

  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Security', href: '/security' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/api' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header logo="Palrin" navItems={navItems} ctaButton="Get Started" />

      {/* Hero Section */}
      <Section padding="lg" background="white">
        <PageContainer width="standard">
          <div className="max-w-3xl">
            <Badge variant="blue">Analytics Platform</Badge>
            <h1 className="mt-4 mb-6 text-5xl font-extrabold tracking-tight text-neutral-950">
              Real-Time Analytics Engine
            </h1>
            <p className="mb-8 text-xl text-neutral-600 leading-relaxed">
              Process and analyze millions of data points per second with our distributed
              analytics engine. Built for scale, optimized for performance, designed for
              enterprises that demand precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                Start Free Trial
              </Button>
              <Button variant="secondary" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Technical Overview */}
      <Section background="gray">
        <PageContainer width="standard">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-neutral-950">
              Technical Specifications
            </h2>
            <p className="text-lg text-neutral-600">
              Enterprise-grade performance metrics and capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specs.map((spec, index) => (
              <div key={index} className="card-elevated">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {spec.label}
                  </h3>
                  <StatusIndicator status={spec.status} label="" />
                </div>
                <p className="text-2xl font-bold text-black">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* Key Features */}
      <Section background="white">
        <PageContainer width="standard">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-neutral-950">
              Core Capabilities
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to transform data into actionable insights
            </p>
          </div>

          <div className="grid-2">
            {/* Feature 1 */}
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900/10 text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Lightning-Fast Queries
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Distributed query execution across multiple nodes ensures sub-100ms response
                times even on datasets exceeding petabytes. Intelligent caching and query
                optimization happen automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900/10 text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Scalable Storage
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Store unlimited data with automatic sharding and replication. Our storage
                layer scales horizontally, ensuring consistent performance as your data grows.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900/10 text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Enterprise Security
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                End-to-end encryption, role-based access control, and comprehensive audit
                logs. SOC 2 Type II certified with GDPR and HIPAA compliance built-in.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900/10 text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Developer-Friendly APIs
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                RESTful APIs, GraphQL support, and SDKs for all major languages. Comprehensive
                documentation and code examples get you up and running in minutes.
              </p>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Pricing Comparison */}
      <Section background="gray">
        <PageContainer width="standard">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-neutral-950">
              Feature Comparison
            </h2>
            <p className="text-lg text-neutral-600">
              Choose the plan that fits your organization's needs
            </p>
          </div>

          <div className="card-elevated">
            <DataTable
              columns={comparisonColumns}
              data={comparisonData}
            />
          </div>

          <div className="mt-8 text-center">
            <Button variant="primary" size="lg">
              View Detailed Pricing
            </Button>
          </div>
        </PageContainer>
      </Section>

      {/* Integrations */}
      <Section background="white">
        <PageContainer width="standard">
          <div className="mb-12">
            <h2 className="mb-4 text-3xl font-bold text-neutral-950">
              Seamless Integrations
            </h2>
            <p className="text-lg text-neutral-600">
              Connect with the tools your team already uses
            </p>
          </div>

          <div className="grid-3">
            {integrations.map((integration, index) => (
              <div key={index} className="card-minimal">
                <Badge variant="neutral">{integration.category}</Badge>
                <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                  {integration.name}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Native integration available
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-neutral-600 mb-4">
              Don't see your tool? Build custom integrations with our API.
            </p>
            <Button variant="secondary">
              View All Integrations
            </Button>
          </div>
        </PageContainer>
      </Section>

      {/* CTA Section */}
      <Section background="dark">
        <PageContainer width="standard">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-xl text-neutral-400">
              Start your free 30-day trial. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg">
                Start Free Trial
              </Button>
              <button className="btn-secondary text-base px-8 py-3 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700">
                Schedule Demo
              </button>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Footer */}
      <Footer columns={footerColumns} bottomLinks={[]} />
    </div>
  );
}
