import React from 'react';

/**
 * Palantir-Inspired Component Library
 * 
 * A collection of reusable, accessible components following
 * Palantir's clean, minimalist, data-centric design language.
 */

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

/**
 * Primary Navigation Header
 * Clean, minimal header with logo and navigation
 */
export function Header({ logo, navItems, ctaButton }) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <nav className="container-standard">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-neutral-950">
              {logo || 'Palrin'}
            </a>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems?.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`nav-link ${item.active ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          {ctaButton && (
            <div className="flex items-center space-x-4">
              <button className="btn-primary">
                {ctaButton}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

/**
 * Footer Component
 * Structured footer with multiple columns
 */
export function Footer({ columns, bottomLinks }) {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container-standard section-padding">
        {/* Footer Columns */}
        <div className="grid-4 mb-12">
          {columns?.map((column, index) => (
            <div key={index}>
              <h6 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-700">
                {column.title}
              </h6>
              <ul className="space-y-3">
                {column.links?.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="divider"></div>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-neutral-600">
            © 2026 Palrin. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {bottomLinks?.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================

/**
 * Hero Section
 * Large, bold hero with heading and CTA
 */
export function Hero({ title, subtitle, primaryCTA, secondaryCTA }) {
  return (
    <section className="section-padding-lg bg-white">
      <div className="container-standard">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-neutral-950">
            {title}
          </h1>
          <p className="mb-8 text-xl text-neutral-600 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            {primaryCTA && (
              <button className="btn-primary text-base px-8 py-3">
                {primaryCTA}
              </button>
            )}
            {secondaryCTA && (
              <button className="btn-secondary text-base px-8 py-3">
                {secondaryCTA}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Feature Grid
 * Modular grid of features with icons
 */
export function FeatureGrid({ title, subtitle, features }) {
  return (
    <section className="section-padding">
      <div className="container-standard">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="mb-16 max-w-2xl">
            {title && (
              <h2 className="mb-4 text-4xl font-bold text-neutral-950">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-neutral-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid-3">
          {features?.map((feature, index) => (
            <div key={index} className="group">
              {/* Icon */}
              {feature.icon && (
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900/10 text-black">
                  {feature.icon}
                </div>
              )}
              
              {/* Content */}
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Content Section with Image
 * Two-column layout with text and visual
 */
export function ContentWithImage({ title, content, imageSrc, imageAlt, imagePosition = 'right', cta }) {
  const isImageRight = imagePosition === 'right';
  
  return (
    <section className="section-padding bg-neutral-50">
      <div className="container-standard">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${!isImageRight ? 'md:flex-row-reverse' : ''}`}>
          {/* Text Content */}
          <div className={isImageRight ? '' : 'md:order-2'}>
            <h2 className="mb-4 text-3xl font-bold text-neutral-950">
              {title}
            </h2>
            <div className="mb-6 text-neutral-600 leading-relaxed space-y-4">
              {content}
            </div>
            {cta && (
              <button className="btn-primary">
                {cta}
              </button>
            )}
          </div>

          {/* Image */}
          <div className={isImageRight ? '' : 'md:order-1'}>
            <div className="rounded-lg overflow-hidden border border-neutral-200 bg-white">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={imageAlt || ''}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-video bg-neutral-100"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Stats Section
 * Data-centric display of key metrics
 */
export function StatsSection({ title, stats }) {
  return (
    <section className="section-padding bg-white">
      <div className="container-standard">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-bold text-neutral-950">
            {title}
          </h2>
        )}
        
        <div className="grid-4">
          {stats?.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-bold text-black">
                {stat.value}
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-neutral-600">
                {stat.label}
              </div>
              {stat.description && (
                <p className="mt-2 text-sm text-neutral-500">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * Card Component
 * Minimal card with hover effect
 */
export function Card({ title, description, badge, cta, onClick }) {
  return (
    <div 
      className="card-minimal cursor-pointer"
      onClick={onClick}
    >
      {badge && (
        <span className="badge badge-blue mb-3">
          {badge}
        </span>
      )}
      <h3 className="mb-2 text-lg font-semibold text-neutral-900">
        {title}
      </h3>
      {description && (
        <p className="mb-4 text-sm text-neutral-600">
          {description}
        </p>
      )}
      {cta && (
        <span className="text-sm font-medium text-black hover:text-black transition-colors">
          {cta} →
        </span>
      )}
    </div>
  );
}

/**
 * Button Components
 */
export function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const baseClass = variant === 'primary' ? 'btn-primary' :
                   variant === 'secondary' ? 'btn-secondary' :
                   'btn-ghost';
  
  const sizeClass = size === 'sm' ? 'text-xs px-3 py-2' :
                    size === 'lg' ? 'text-base px-6 py-3' :
                    '';
  
  return (
    <button className={`${baseClass} ${sizeClass}`} {...props}>
      {children}
    </button>
  );
}

/**
 * Input Component
 */
export function Input({ label, error, helpText, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'border-error' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

/**
 * Badge Component
 */
export function Badge({ children, variant = 'neutral' }) {
  const variantClass = variant === 'blue' ? 'badge-blue' :
                       variant === 'teal' ? 'badge-teal' :
                       'badge-neutral';
  
  return (
    <span className={`badge ${variantClass}`}>
      {children}
    </span>
  );
}

/**
 * Status Indicator
 */
export function StatusIndicator({ status, label }) {
  const statusClass = status === 'success' ? 'status-success' :
                      status === 'warning' ? 'status-warning' :
                      status === 'error' ? 'status-error' :
                      'status-info';
  
  return (
    <div className="inline-flex items-center">
      <span className={`status-dot ${statusClass}`}></span>
      <span className="text-sm text-neutral-700">{label}</span>
    </div>
  );
}

/**
 * Data Table Component
 */
export function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns?.map((column, index) => (
              <th key={index}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns?.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

/**
 * Page Container
 */
export function PageContainer({ children, width = 'standard' }) {
  const widthClass = width === 'narrow' ? 'container-narrow' :
                     width === 'wide' ? 'container-wide' :
                     'container-standard';
  
  return (
    <div className={widthClass}>
      {children}
    </div>
  );
}

/**
 * Section
 */
export function Section({ children, padding = 'default', background = 'white' }) {
  const paddingClass = padding === 'sm' ? 'section-padding-sm' :
                       padding === 'lg' ? 'section-padding-lg' :
                       'section-padding';
  
  const bgClass = background === 'gray' ? 'bg-neutral-50' :
                  background === 'dark' ? 'bg-neutral-900' :
                  'bg-white';
  
  return (
    <section className={`${paddingClass} ${bgClass}`}>
      {children}
    </section>
  );
}

/**
 * Grid Layout
 */
export function Grid({ children, columns = 3 }) {
  const gridClass = columns === 2 ? 'grid-2' :
                    columns === 4 ? 'grid-4' :
                    'grid-3';
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  );
}

// Export all components
export default {
  // Navigation
  Header,
  Footer,
  
  // Content
  Hero,
  FeatureGrid,
  ContentWithImage,
  StatsSection,
  
  // UI
  Card,
  Button,
  Input,
  Badge,
  StatusIndicator,
  DataTable,
  
  // Layout
  PageContainer,
  Section,
  Grid,
};
