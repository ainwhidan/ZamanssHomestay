import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

function useScrollAnimation() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    const elements = ref.current?.querySelectorAll('.animate');
    elements?.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function About() {
  const s1 = useScrollAnimation();
  const s2 = useScrollAnimation();
  const s3 = useScrollAnimation();
  const s4 = useScrollAnimation();

  const whyChooseUs = [
    { num: '01', title: 'Handpicked Properties',     desc: 'Every homestay is personally vetted and maintained to ensure cleanliness, safety, and comfort.' },
    { num: '02', title: 'Warm Malaysian Hospitality', desc: 'We treat every guest like family — from booking to check-out, we are always here for you.' },
    { num: '03', title: 'Affordable for Everyone',   desc: 'Quality accommodation that does not break the bank. Great value for every budget.' },
    { num: '04', title: 'Easy Online Booking',       desc: 'Book in minutes with our simple system. Pick your dates, confirm, and you are set.' },
    { num: '05', title: 'Fully Equipped Homes',      desc: 'WiFi, air-conditioning, full kitchen, and everything you need for a comfortable stay.' },
    { num: '06', title: '24/7 Support',              desc: 'Our team is always reachable via WhatsApp or phone. Whatever you need, we are one message away.' },
  ];

  const milestones = [
    { year: '2021', title: 'Founded',        desc: 'Zamanss Homestay started with 2 properties in Ipoh, Perak.' },
    { year: '2022', title: 'Expanded',       desc: 'Grew to 5 properties to meet the growing demand from guests.' },
    { year: '2023', title: '500+ Guests',    desc: 'Reached the milestone of serving over 500 happy guests.' },
    { year: '2024', title: 'Online Booking', desc: 'Launched our online booking system for easier reservations.' },
  ];

  const team = [
    { name: 'Zaman', role: 'Owner & Founder',  initial: 'Z', desc: 'Started Zamanss Homestay with a vision to provide comfortable and affordable stays in Ipoh.' },
    { name: 'Sarah', role: 'Property Manager', initial: 'S', desc: 'Ensures all 5 properties are well-maintained and guests have the best experience.' },
    { name: 'Amir',  role: 'Guest Relations',  initial: 'A', desc: 'Always ready to assist guests with bookings, special requests, and local recommendations.' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <p className="section-tag" style={{color:'rgba(255,255,255,0.7)'}}>Our Story</p>
          <h1>Zamanss Homestay</h1>
          <p>A family-run homestay business built on warmth, comfort, and genuine Malaysian hospitality.</p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="about-section" ref={s1}>
        <div className="container">
          <div className="about-intro">
            <div className="about-intro-text animate fade-left">
              <p className="section-tag">Who We Are</p>
              <h2>Your Home Away From Home in Ipoh</h2>
              <p>Zamanss Homestay was founded with one simple goal — to make every guest feel at home. We believe that a great stay goes beyond just a bed and a roof. It is about the warmth of the people, the cleanliness of the space, and the comfort of knowing someone cares.</p>
              <p>Located in the heart of Ipoh, Perak, our 5 carefully maintained properties offer everything you need for a relaxing and memorable stay.</p>
              <Link to="/homestays" className="about-cta-btn">Explore Our Homestays</Link>
            </div>
            <div className="about-intro-stats animate fade-right">
              <div className="about-stat"><strong>5</strong><span>Properties</span></div>
              <div className="about-stat"><strong>500+</strong><span>Happy Guests</span></div>
              <div className="about-stat"><strong>4.9</strong><span>Average Rating</span></div>
              <div className="about-stat"><strong>3 yrs</strong><span>Of Service</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="about-why" ref={s2}>
        <div className="container">
          <div className="section-header animate fade-up">
            <p className="section-tag">Why Choose Us</p>
            <h2>The Zamanss Difference</h2>
            <p className="section-sub">Here is what sets us apart from the rest.</p>
          </div>
          <div className="why-grid">
            {whyChooseUs.map((item, i) => (
              <div className={`why-card animate fade-up delay-${i % 3}`} key={i}>
                <div className="why-number">{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="about-timeline" ref={s3}>
        <div className="container">
          <div className="section-header animate fade-up">
            <p className="section-tag">Our Journey</p>
            <h2>How We Got Here</h2>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div className={`timeline-item animate fade-up delay-${i % 3}`} key={i}>
                <div className="timeline-year">{m.year}</div>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="about-team" ref={s4}>
        <div className="container">
          <div className="section-header animate fade-up">
            <p className="section-tag">The People Behind</p>
            <h2>Meet Our Team</h2>
          </div>
          <div className="team-grid">
          {/* Top row — 1 card centered */}
          <div className="team-top-row">
            <div className="team-card animate fade-up delay-0">
              <div className="team-avatar">{team[0].initial}</div>
              <h3>{team[0].name}</h3>
              <p className="team-role">{team[0].role}</p>
              <p className="team-desc">{team[0].desc}</p>
            </div>
          </div>

          {/* Bottom row — 5 cards */}
          <div className="team-bottom-row">
            {[
              { name: 'Nadiatul Arfah', role: 'Project Manager', initial: '1' },
              { name: 'Afiq Aiman', role: 'Software Tester', initial: '2' },
              { name: 'Nurul Ain', role: 'Programmer', initial: '3' },
              { name: 'Arif Khumaini', role: 'UI/UX Designer', initial: '4' },
              { name: 'Shi Kaiyan', role: 'Data Analyst', initial: '5' },
            ].map((t, i) => (
              <div className={`team-card animate fade-up delay-${i % 3}`} key={i}>
                <div className="team-avatar">{t.initial}</div>
                <h3>{t.name}</h3>
                <p className="team-role">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Experience Zamanss?</h2>
          <p>Book your stay today and discover why hundreds of guests keep coming back.</p>
          <div className="about-cta-btns">
            <Link to="/homestays" className="cta-primary">Browse Homestays</Link>
            <Link to="/contact"   className="cta-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;