"use client";
import React from "react";
import { Card, CardContent } from "../components/ui/Card";
import Header from "../components/Header";
import ThemeProvider from "../components/ThemeProvider";
import "./about.css";
import Footer from "../components/Footer";

export default function About() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="about-container py-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <section className="about-section slide-in-from-bottom-4">
              <Card className="about-card bg-card border border-border shadow-sm">
                <CardContent className="p-8 md:p-12 space-y-12">
                  {/* Page Heading */}
                  <header className="about-heading">
                    <h2 className="about-title">
                      About CodeMentor
                    </h2>
                    <p className="about-subtitle">
                      From <strong>problem → code → output → visual intuition</strong>. Generate diagrams, get hints, and see control flow—without switching tools.
                    </p>
                  </header>

                  {/* Stats */}
                  {/* <section>
                    <div className="stats-grid">
                      <Stat kpi="10x" label="Faster understanding" />
                      <Stat kpi=">95%" label="Test cases auto" />
                      <Stat kpi=">30" label="Languages supported" />
                    </div>
                  </section> */}

                  {/* Divider */}
                  <hr />

                  {/* How it Works */}
                  <section>
                    <h3 className="section-heading">How it works</h3>
                    <ol className="steps-list">
                      <Step
                        n="1"
                        title="Describe the problem"
                        body="Paste an example or constraints. We extract inputs, outputs, and edge cases automatically."
                      />
                      <Step
                        n="2"
                        title="Get code + diagrams"
                        body="We generate an initial solution and a Mermaid diagram so you can see the logic instantly."
                      />
                      <Step
                        n="3"
                        title="Iterate with hints"
                        body="Ask for optimizations, complexity analysis, or testcases until it clicks."
                      />
                    </ol>
                  </section>

                  {/* Divider */}
                  <hr />

                  {/* What / Why / Who */}
                  <section>
                    <div className="blurbs-grid">
                      <Blurb
                        title="What it does"
                        icon={<IconSpark />}
                        text="Parses your problem, generates code, runs it, and explains the approach with compact visuals."
                      />
                      <Blurb
                        title="Why it's useful"
                        icon={<IconBolt />}
                        text="Cuts the loop between idea and clarity. Inspect control flow and get targeted hints instantly."
                      />
                      <Blurb
                        title="Who it's for"
                        icon={<IconTarget />}
                        text="Students, interview preppers, and builders who want fast, visual algorithm insight."
                      />
                    </div>
                  </section>

                  {/* Divider */}
                  <hr />

                  {/* Values */}
                  <section>
                    <div className="values-grid">
                      <Value title="Clarity first" body="Compact UI, minimal noise, and visuals that reduce cognitive load." />
                      <Value title="Speed matters" body="Tight feedback loops: run code, see output, adjust." />
                      <Value title="Learn by doing" body="Hands-on practice beats passive reading every time." />
                    </div>
                  </section>

                  {/* Divider */}
                  <hr />

                  {/* FAQ */}
                  <section>
                    <h3 className="section-heading">FAQ</h3>
                    <div className="faq-list">
                      <details className="faq-item">
                        <summary className="faq-summary">
                          Do I have to know Mermaid?
                          <span className="faq-arrow">▾</span>
                        </summary>
                        <p className="faq-answer">
                          Nope. We generate diagrams for you, and you can tweak them if you'd like.
                        </p>
                      </details>
                      <details className="faq-item">
                        <summary className="faq-summary">
                          Can I use my own test cases?
                          <span className="faq-arrow">▾</span>
                        </summary>
                        <p className="faq-answer">
                          Yes. Paste them in and we'll run and visualize them alongside generated cases.
                        </p>
                      </details>
                      <details className="faq-item">
                        <summary className="faq-summary">
                          Which languages are supported?
                          <span className="faq-arrow">▾</span>
                        </summary>
                        <p className="faq-answer">
                          Common interview and systems languages, with more added regularly.
                        </p>
                      </details>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="about-footer">
                    Questions or ideas?{" "}
                    <a href="mailto:support@compilerai.app">
                      Email us
                    </a>{" "}
                    — we read everything.
                  </footer>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </ThemeProvider>
  );
}

/* ---- Small presentational subcomponents ---- */
function Blurb({ title, text, icon }) {
  return (
    <div className="blurb-item">
      <div className="blurb-header">
        <span className="blurb-icon">{icon}</span>
        <h4 className="blurb-title">{title}</h4>
      </div>
      <p className="blurb-text">{text}</p>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <li className="step-item">
      <span className="step-number">{n}</span>
      <div className="step-content">
        <div className="step-title">{title}</div>
        <p className="step-body">{body}</p>
      </div>
    </li>
  );
}

function Value({ title, body }) {
  return (
    <div className="value-item">
      <div className="value-title">{title}</div>
      <p className="value-body">{body}</p>
    </div>
  );
}

/* ---- Tiny inline icons (no external deps) ---- */
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4m0 12v4m8-8h-4M8 12H4m11.314-6.314l-2.828 2.828m0 6.972 2.828 2.828M8.514 5.686l2.828 2.828m0 6.972-2.828 2.828" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
    </svg>
  );
}