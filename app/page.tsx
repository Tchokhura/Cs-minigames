import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <>
      <div className="background-overlay"></div>
      <div className="home-bg-blur home-bg-blur-1"></div>
      <div className="home-bg-blur home-bg-blur-2"></div>

      <main className="container home-container">
        <header className="topbar">
          <Link href="/" className="topbar-brand">
            CS2 Picker
          </Link>

          <div className="topbar-actions">
            <ThemeToggle />
          </div>
        </header>

        <header className="hero hero-home hero-home-advanced">
          <div className="hero-kicker">Counter-Strike 2</div>
          <h1>Map Picker</h1>
          <p>
            Pick your battleground faster with a dedicated Competitive and
            Wingman flow. Clean visuals, instant map selection, elimination
            mode, sound effects and animation control.
          </p>

          <div className="hero-mini-features">
            <span className="hero-pill">Random Spin</span>
            <span className="hero-pill">Elimination Mode</span>
            <span className="hero-pill">Sound Toggle</span>
            <span className="hero-pill">Animation Skip</span>
          </div>
        </header>

        <section className="mode-page-grid mode-page-grid-premium">
          <Link
            href="/competitive"
            className="mode-page-card premium-mode-card competitive-home-card"
          >
            <div className="premium-card-glow"></div>
            <div className="mode-card-overlay"></div>

            <div className="premium-card-top">
              <span className="mode-page-badge">5V5</span>
              <span className="mode-card-label">Full Map Pool</span>
            </div>

            <div className="mode-card-content premium-card-content">
              <h2>Competitive</h2>
              <p>
                The main CS2 pool with your full picker system: random
                selection, elimination flow, include/exclude toggles, reset,
                sound and animation controls.
              </p>

              <div className="mode-card-features">
                <span>14 Maps</span>
                <span>Spin Mode</span>
                <span>Elimination</span>
              </div>

              <span className="mode-page-link">Open Competitive</span>
            </div>
          </Link>

          <Link
            href="/wingman"
            className="mode-page-card premium-mode-card wingman-home-card"
          >
            <div className="premium-card-glow premium-card-glow-blue"></div>
            <div className="mode-card-overlay"></div>

            <div className="premium-card-top">
              <span className="mode-page-badge mode-page-badge-blue">2V2</span>
              <span className="mode-card-label mode-card-label-blue">
                Wingman Pool
              </span>
            </div>

            <div className="mode-card-content premium-card-content">
              <h2>Wingman</h2>
              <p>
                A separate Wingman experience with its own map pool and the same
                polished controls: random spin, elimination mode, sound effects
                and animation toggle.
              </p>

              <div className="mode-card-features mode-card-features-blue">
                <span>6 Maps</span>
                <span>Spin Mode</span>
                <span>Elimination</span>
              </div>

              <span className="mode-page-link">Open Wingman</span>
            </div>
          </Link>
        </section>
      </main>
    </>
  );
}
