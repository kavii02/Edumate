import { useState, useEffect } from 'react'
import './LandingPage.css'

export default function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const features = [
    {
      icon: '🧠',
      title: 'AI Performance Analysis',
      description: 'Decision Tree model analyses quiz scores, attendance, and assignments to predict student performance trajectories.',
    },
    {
      icon: '⚠️',
      title: 'At-Risk Student Detection',
      description: 'Automatically identifies students at Low, Medium, or High risk so tutors can intervene early.',
    },
    {
      icon: '📊',
      title: 'Topic Difficulty Analysis',
      description: 'Tracks understanding feedback across topics to reveal which subjects students find most challenging.',
    },
    {
      icon: '📝',
      title: 'Adaptive Quiz Generation',
      description: 'Tutors can create quizzes manually or with AI assistance. Students get instant scored feedback.',
    },
    {
      icon: '💬',
      title: 'Understanding Feedback',
      description: 'Students mark each topic as Understood, Partially Understood, or Confused — giving tutors actionable insights.',
    },
    {
      icon: '📅',
      title: 'Attendance Tracking',
      description: 'Automated attendance records with visual dashboards for both students and tutors.',
    },
    {
      icon: '🔁',
      title: 'Skill Barter System',
      description: 'Students offer and request skills, creating a collaborative peer-learning community.',
    },
    {
      icon: '🤝',
      title: 'Peer Matching',
      description: 'Smart algorithm matches students based on offered and requested skills for effective collaboration.',
    },
    {
      icon: '📆',
      title: 'Study Planner',
      description: 'Personalised task and study session planner to help students stay organised and on track.',
    },
    {
      icon: '🏆',
      title: 'Gamification & Rewards',
      description: 'Badges, points, and leaderboards motivate students to stay engaged and improve performance.',
    },
    {
      icon: '📚',
      title: 'Course & Material Management',
      description: 'Tutors upload structured learning materials. Students access resources anytime from their dashboard.',
    },
    {
      icon: '🛡️',
      title: 'Admin Control Panel',
      description: 'Comprehensive admin dashboard for user management, course approval, system monitoring, and logs.',
    },
  ]

  const steps = [
    { number: '01', label: 'Student Learns', icon: '📖', desc: 'Access course materials and watch learning resources' },
    { number: '02', label: 'Completes Quizzes', icon: '✏️', desc: 'Attempt quizzes and receive immediate scored feedback' },
    { number: '03', label: 'Provides Feedback', icon: '💬', desc: 'Mark topics as Understood, Partial, or Confused' },
    { number: '04', label: 'AI Analyses', icon: '🧠', desc: 'Decision Tree processes performance data' },
    { number: '05', label: 'Risk Detected', icon: '⚠️', desc: 'System flags at-risk students automatically' },
    { number: '06', label: 'Tutor Acts', icon: '👨‍🏫', desc: 'Tutor receives insights and provides targeted support' },
  ]

  const roles = [
    {
      title: 'Student',
      icon: '🎓',
      color: 'role-card--cyan',
      points: [
        'Access enrolled courses & materials',
        'Attempt quizzes and view results',
        'Track attendance and progress',
        'Submit understanding feedback',
        'Use Skill Barter and peer matching',
        'Manage study planner',
        'Earn badges and climb the leaderboard',
      ],
    },
    {
      title: 'Tutor',
      icon: '👨‍🏫',
      color: 'role-card--purple',
      points: [
        'Manage courses and materials',
        'Create quizzes (manual or AI-assisted)',
        'Monitor student performance',
        'View AI risk predictions',
        'Track attendance and feedback',
        'Send course announcements',
        'View topic difficulty analysis',
      ],
    },
    {
      title: 'Admin',
      icon: '🛡️',
      color: 'role-card--pink',
      points: [
        'Manage all user accounts',
        'Approve and manage courses',
        'View system logs and activity',
        'Monitor platform health',
        'Generate user reports',
        'Manage account settings',
        'Oversee the full platform',
      ],
    },
  ]

  return (
    <div className="lp-root">
      {/* Animated background */}
      <div className="lp-bg" aria-hidden="true">
        <div className="lp-bg__orb lp-bg__orb--purple" />
        <div className="lp-bg__orb lp-bg__orb--cyan" />
        <div className="lp-bg__orb lp-bg__orb--pink" />
        <div className="lp-bg__grid" />
      </div>

      {/* ── NAVBAR ── */}
      <header className={`lp-navbar${scrolled ? ' lp-navbar--scrolled' : ''}`}>
        <div className="lp-navbar__inner">
          <button className="lp-brand" onClick={() => scrollTo('hero')} type="button">
            <span className="lp-brand__mark">E</span>
            <span className="lp-brand__name">EduMate</span>
          </button>

          <nav className="lp-nav" aria-label="Main navigation">
            <button type="button" onClick={() => scrollTo('hero')}>Home</button>
            <button type="button" onClick={() => scrollTo('features')}>Features</button>
            <button type="button" onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button type="button" onClick={() => scrollTo('roles')}>Roles</button>
          </nav>

          <div className="lp-navbar__actions">
            <button className="lp-btn lp-btn--ghost" type="button" onClick={onGetStarted}>
              Login
            </button>
            <button className="lp-btn lp-btn--primary" type="button" onClick={onGetStarted}>
              Get Started
            </button>
          </div>

          {/* Hamburger for mobile */}
          <button
            className="lp-hamburger"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className={`lp-hamburger__bar${mobileMenuOpen ? ' open' : ''}`} />
            <span className={`lp-hamburger__bar${mobileMenuOpen ? ' open' : ''}`} />
            <span className={`lp-hamburger__bar${mobileMenuOpen ? ' open' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            <button type="button" onClick={() => scrollTo('hero')}>Home</button>
            <button type="button" onClick={() => scrollTo('features')}>Features</button>
            <button type="button" onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button type="button" onClick={() => scrollTo('roles')}>Roles</button>
            <button className="lp-btn lp-btn--ghost" type="button" onClick={onGetStarted}>Login</button>
            <button className="lp-btn lp-btn--primary" type="button" onClick={onGetStarted}>Get Started</button>
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ── */}
        <section id="hero" className="lp-hero">
          <div className="lp-hero__content">
            <div className="lp-hero__badge">
              <span className="lp-hero__badge-dot" />
              A/L ICT Smart Learning Platform
            </div>

            <h1 className="lp-hero__heading">
              Smart Learning.{' '}
              <span className="lp-gradient-text">Better Understanding.</span>
              <br />
              Better Results.
            </h1>

            <p className="lp-hero__description">
              EduMate is an intelligent Learning Management System built for A/L ICT students and tutors.
              AI-powered performance analysis, adaptive quizzes, peer collaboration, and real-time insights
              — all in one platform.
            </p>

            <div className="lp-hero__actions">
              <button className="lp-btn lp-btn--primary lp-btn--lg" type="button" onClick={onGetStarted}>
                Get Started Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button className="lp-btn lp-btn--ghost lp-btn--lg" type="button" onClick={onGetStarted}>
                Sign In
              </button>
            </div>

            <div className="lp-hero__stats">
              <div className="lp-hero__stat">
                <span className="lp-hero__stat-value">3</span>
                <span className="lp-hero__stat-label">User Roles</span>
              </div>
              <div className="lp-hero__stat-divider" />
              <div className="lp-hero__stat">
                <span className="lp-hero__stat-value">AI</span>
                <span className="lp-hero__stat-label">Risk Prediction</span>
              </div>
              <div className="lp-hero__stat-divider" />
              <div className="lp-hero__stat">
                <span className="lp-hero__stat-value">12+</span>
                <span className="lp-hero__stat-label">Smart Features</span>
              </div>
            </div>
          </div>

          <div className="lp-hero__visual" aria-hidden="true">
            <div className="lp-hero__dashboard-preview">
              <div className="lp-preview__bar">
                <span className="lp-preview__dot lp-preview__dot--red" />
                <span className="lp-preview__dot lp-preview__dot--yellow" />
                <span className="lp-preview__dot lp-preview__dot--green" />
                <span className="lp-preview__title">EduMate Dashboard</span>
              </div>
              <div className="lp-preview__body">
                <div className="lp-preview__sidebar">
                  <div className="lp-preview__sidebar-item lp-preview__sidebar-item--active" />
                  <div className="lp-preview__sidebar-item" />
                  <div className="lp-preview__sidebar-item" />
                  <div className="lp-preview__sidebar-item" />
                  <div className="lp-preview__sidebar-item" />
                </div>
                <div className="lp-preview__content">
                  <div className="lp-preview__stat-row">
                    <div className="lp-preview__stat-card lp-preview__stat-card--cyan">
                      <div className="lp-preview__stat-num">87%</div>
                      <div className="lp-preview__stat-lbl">Quiz Score</div>
                    </div>
                    <div className="lp-preview__stat-card lp-preview__stat-card--purple">
                      <div className="lp-preview__stat-num">95%</div>
                      <div className="lp-preview__stat-lbl">Attendance</div>
                    </div>
                    <div className="lp-preview__stat-card lp-preview__stat-card--green">
                      <div className="lp-preview__stat-num">Low</div>
                      <div className="lp-preview__stat-lbl">Risk Level</div>
                    </div>
                  </div>
                  <div className="lp-preview__chart">
                    <div className="lp-preview__chart-bar" style={{ height: '40%' }} />
                    <div className="lp-preview__chart-bar" style={{ height: '65%' }} />
                    <div className="lp-preview__chart-bar" style={{ height: '55%' }} />
                    <div className="lp-preview__chart-bar" style={{ height: '80%' }} />
                    <div className="lp-preview__chart-bar lp-preview__chart-bar--active" style={{ height: '87%' }} />
                  </div>
                  <div className="lp-preview__risk-row">
                    <div className="lp-preview__risk-badge lp-preview__risk-badge--low">Low Risk</div>
                    <div className="lp-preview__risk-badge lp-preview__risk-badge--med">Medium Risk</div>
                    <div className="lp-preview__risk-badge lp-preview__risk-badge--high">High Risk</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lp-hero__glow" aria-hidden="true" />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="lp-section">
          <div className="lp-container">
            <div className="lp-section__header">
              <p className="lp-section__eyebrow">Platform Features</p>
              <h2 className="lp-section__title">Everything you need to learn and teach smarter</h2>
              <p className="lp-section__subtitle">
                EduMate combines AI-powered analytics, collaborative tools, and intuitive dashboards
                to create a complete learning environment.
              </p>
            </div>

            <div className="lp-features-grid">
              {features.map((f) => (
                <div key={f.title} className="lp-feature-card">
                  <div className="lp-feature-card__icon">{f.icon}</div>
                  <h3 className="lp-feature-card__title">{f.title}</h3>
                  <p className="lp-feature-card__desc">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="lp-section lp-section--alt">
          <div className="lp-container">
            <div className="lp-section__header">
              <p className="lp-section__eyebrow">How It Works</p>
              <h2 className="lp-section__title">The EduMate learning cycle</h2>
              <p className="lp-section__subtitle">
                A continuous feedback loop that keeps students learning and gives tutors the insights they need.
              </p>
            </div>

            <div className="lp-steps">
              {steps.map((step, idx) => (
                <div key={step.number} className="lp-step">
                  <div className="lp-step__connector" aria-hidden="true">
                    {idx < steps.length - 1 && <div className="lp-step__line" />}
                  </div>
                  <div className="lp-step__circle">
                    <span className="lp-step__icon">{step.icon}</span>
                  </div>
                  <div className="lp-step__body">
                    <span className="lp-step__num">{step.number}</span>
                    <h3 className="lp-step__label">{step.label}</h3>
                    <p className="lp-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROLES ── */}
        <section id="roles" className="lp-section">
          <div className="lp-container">
            <div className="lp-section__header">
              <p className="lp-section__eyebrow">User Roles</p>
              <h2 className="lp-section__title">Designed for everyone in the classroom</h2>
              <p className="lp-section__subtitle">
                Three distinct role-based dashboards tailored to each user's needs.
              </p>
            </div>

            <div className="lp-roles-grid">
              {roles.map((role) => (
                <div key={role.title} className={`lp-role-card ${role.color}`}>
                  <div className="lp-role-card__header">
                    <span className="lp-role-card__icon">{role.icon}</span>
                    <h3 className="lp-role-card__title">{role.title}</h3>
                  </div>
                  <ul className="lp-role-card__list">
                    {role.points.map((pt) => (
                      <li key={pt}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <button className="lp-btn lp-btn--role" type="button" onClick={onGetStarted}>
                    Sign in as {role.title}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className="lp-cta">
          <div className="lp-container">
            <div className="lp-cta__card">
              <div className="lp-cta__glow" aria-hidden="true" />
              <p className="lp-section__eyebrow" style={{ textAlign: 'center' }}>Get Started Today</p>
              <h2 className="lp-cta__heading">Ready to make learning smarter?</h2>
              <p className="lp-cta__sub">
                Join EduMate and experience AI-powered learning for A/L ICT students and tutors.
              </p>
              <div className="lp-cta__actions">
                <button className="lp-btn lp-btn--primary lp-btn--lg" type="button" onClick={onGetStarted}>
                  Get Started
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button className="lp-btn lp-btn--ghost lp-btn--lg" type="button" onClick={onGetStarted}>
                  Login
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__inner">
            <div className="lp-footer__brand">
              <div className="lp-brand">
                <span className="lp-brand__mark">E</span>
                <span className="lp-brand__name">EduMate</span>
              </div>
              <p className="lp-footer__tagline">
                Smart Tutor Assistance Learning Management System<br />for A/L ICT
              </p>
            </div>

            <div className="lp-footer__links">
              <div className="lp-footer__col">
                <p className="lp-footer__col-title">Platform</p>
                <button type="button" onClick={() => scrollTo('features')}>Features</button>
                <button type="button" onClick={() => scrollTo('how-it-works')}>How It Works</button>
                <button type="button" onClick={() => scrollTo('roles')}>Roles</button>
              </div>
              <div className="lp-footer__col">
                <p className="lp-footer__col-title">Access</p>
                <button type="button" onClick={onGetStarted}>Student Login</button>
                <button type="button" onClick={onGetStarted}>Tutor Login</button>
                <button type="button" onClick={onGetStarted}>Admin Login</button>
              </div>
              <div className="lp-footer__col">
                <p className="lp-footer__col-title">System</p>
                <button type="button" onClick={onGetStarted}>Dashboard</button>
                <button type="button" onClick={onGetStarted}>Quiz Center</button>
                <button type="button" onClick={onGetStarted}>Skill Barter</button>
              </div>
            </div>
          </div>

          <div className="lp-footer__bottom">
            <p>© {new Date().getFullYear()} EduMate — Smart Tutor Assistance LMS for A/L ICT. All rights reserved.</p>
            <p>Built by Group 13 · Final Year Project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
