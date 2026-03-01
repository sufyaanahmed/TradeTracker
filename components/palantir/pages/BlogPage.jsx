import React from 'react';
import {
  Header,
  Footer,
  Section,
  PageContainer,
  Badge,
  Button,
} from '../index';

/**
 * Blog Page Mockup
 * 
 * Content-focused blog layout with:
 * - Featured article
 * - Article grid
 * - Category filtering
 * - Author information
 * - Related content
 */

export default function BlogPage() {
  const navItems = [
    { label: 'Product', href: '/product', active: false },
    { label: 'Solutions', href: '/solutions', active: false },
    { label: 'Company', href: '/company', active: false },
    { label: 'Resources', href: '/resources', active: true },
  ];

  // Featured article
  const featuredArticle = {
    title: 'Building Scalable Data Pipelines: Lessons from 10 Years of Growth',
    excerpt: 'How we evolved our data infrastructure from processing thousands to billions of records per day, and the architectural decisions that made it possible.',
    author: 'Sarah Chen',
    role: 'VP of Engineering',
    date: 'February 20, 2026',
    readTime: '12 min read',
    category: 'Engineering',
    image: '',
  };

  // Article list
  const articles = [
    {
      title: 'Advanced Query Optimization Techniques for Large-Scale Analytics',
      excerpt: 'Deep dive into the query optimization strategies that power sub-100ms response times on petabyte-scale datasets.',
      author: 'Michael Torres',
      date: 'February 18, 2026',
      readTime: '8 min read',
      category: 'Technical',
    },
    {
      title: 'Security-First Architecture: How We Built SOC 2 Type II Compliance',
      excerpt: 'A comprehensive look at the security measures, audits, and processes behind our enterprise-grade compliance.',
      author: 'Emily Rodriguez',
      date: 'February 15, 2026',
      readTime: '10 min read',
      category: 'Security',
    },
    {
      title: 'Customer Success Story: How FinTech Leader Reduced Fraud by 87%',
      excerpt: 'Real-time fraud detection at scale using advanced analytics and machine learning pipelines.',
      author: 'James Park',
      date: 'February 12, 2026',
      readTime: '6 min read',
      category: 'Case Study',
    },
    {
      title: 'The Future of Real-Time Analytics: Edge Computing and Beyond',
      excerpt: 'Exploring emerging trends in distributed computing and what they mean for enterprise analytics.',
      author: 'Dr. Lisa Wang',
      date: 'February 10, 2026',
      readTime: '15 min read',
      category: 'Insights',
    },
    {
      title: 'API Design Principles: Building Developer-Friendly Interfaces',
      excerpt: 'Lessons learned from building APIs used by thousands of developers worldwide.',
      author: 'Alex Kumar',
      date: 'February 8, 2026',
      readTime: '7 min read',
      category: 'Developer',
    },
    {
      title: 'Data Privacy in 2026: Navigating GDPR, CCPA, and Emerging Regulations',
      excerpt: 'Compliance strategies for global organizations handling sensitive data across jurisdictions.',
      author: 'Rachel Green',
      date: 'February 5, 2026',
      readTime: '9 min read',
      category: 'Compliance',
    },
  ];

  // Categories
  const categories = [
    'All',
    'Engineering',
    'Security',
    'Case Study',
    'Insights',
    'Developer',
    'Compliance',
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

      {/* Page Header */}
      <Section padding="default" background="white">
        <PageContainer width="standard">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-neutral-950">
              Blog & Insights
            </h1>
            <p className="text-xl text-neutral-600">
              Technical deep dives, product updates, and insights from our team
              building the future of enterprise analytics.
            </p>
          </div>
        </PageContainer>
      </Section>

      {/* Category Filter */}
      <Section padding="sm" background="gray">
        <PageContainer width="standard">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`btn-ghost ${index === 0 ? 'bg-neutral-100' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* Featured Article */}
      <Section background="white">
        <PageContainer width="standard">
          <div className="card-elevated overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="bg-neutral-100 aspect-video md:aspect-auto"></div>
              
              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge variant="blue">{featuredArticle.category}</Badge>
                <h2 className="mt-4 mb-4 text-3xl font-bold text-neutral-950">
                  {featuredArticle.title}
                </h2>
                <p className="mb-6 text-neutral-600 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                {/* Meta */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-10 w-10 rounded-full bg-neutral-200"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-900">
                      {featuredArticle.author}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {featuredArticle.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm text-neutral-600 space-x-4 mb-6">
                  <span>{featuredArticle.date}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                </div>

                <Button variant="primary">
                  Read Article →
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Article Grid */}
      <Section background="gray">
        <PageContainer width="standard">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-950">
              Recent Articles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <article key={index} className="card-minimal group cursor-pointer">
                {/* Thumbnail */}
                <div className="mb-4 aspect-video bg-neutral-100 rounded-md"></div>

                {/* Category */}
                <Badge variant="neutral">{article.category}</Badge>

                {/* Title */}
                <h3 className="mt-3 mb-2 text-lg font-semibold text-neutral-900 group-hover:text-neutral-900 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="mb-4 text-sm text-neutral-600 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {article.author}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-xs text-neutral-500 space-x-4">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <Button variant="secondary">
              Load More Articles
            </Button>
          </div>
        </PageContainer>
      </Section>

      {/* Newsletter Signup */}
      <Section background="white">
        <PageContainer width="narrow">
          <div className="card-elevated text-center">
            <h3 className="mb-4 text-2xl font-bold text-neutral-950">
              Subscribe to Our Newsletter
            </h3>
            <p className="mb-6 text-neutral-600">
              Get the latest technical insights, product updates, and industry trends
              delivered to your inbox every week.
            </p>
            
            <form className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-field flex-1"
                />
                <Button variant="primary">
                  Subscribe
                </Button>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </PageContainer>
      </Section>

      {/* Footer */}
      <Footer columns={footerColumns} bottomLinks={[]} />
    </div>
  );
}
