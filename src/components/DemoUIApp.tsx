import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { colors } from "@/theme/tokens";
import { DEMO_WARDROBE_ITEMS, DEMO_WISHLIST_ITEMS } from "@/data/demoData";
import { computeClosetHealth } from "@/ml/closetHealth";
import { calculateStyleDna } from "@/ml/styleEngine";
import { analyzeWardrobeGaps } from "@/ml/gapAnalyzer";

type ScreenName = "onboarding" | "home" | "closet" | "discover" | "profile" | "checkin";
type Archetype = "dreamer" | "minimalist" | "sunny" | "planner";

const archetypes = {
  dreamer: {
    accent: "#C97B84",
    dark: "#B15E68",
    pale: "#F3DEE1",
    name: "The Homebody Romantic",
    greet: { greet: "Morning, love.", sub: "Soft start today 🌷", tag: "Great", line: "Feels like a soft hug 🤎" },
  },
  minimalist: {
    accent: "#4A3226",
    dark: "#4A3226",
    pale: "#F3E6D3",
    name: "The Quiet Minimalist",
    greet: { greet: "Morning.", sub: "Simple, as always.", tag: "Good", line: "Clean lines. Done." },
  },
  sunny: {
    accent: "#E3A857",
    dark: "#A9762C",
    pale: "#FBEBD1",
    name: "The Sunny Optimist",
    greet: { greet: "Rise & shine!", sub: "Let's glow today ☀️", tag: "Great", line: "Pure sunshine today ☀️" },
  },
  planner: {
    accent: "#8FA377",
    dark: "#5F7A4C",
    pale: "#E4EADA",
    name: "The Cozy Planner",
    greet: { greet: "Morning! Sorted.", sub: "Everything's ready.", tag: "Great", line: "Pre-approved, pre-loved." },
  },
};

interface DemoUIAppProps {
  initialScreen?: ScreenName;
}

export function DemoUIApp({ initialScreen = "home" }: DemoUIAppProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(initialScreen);
  const [currentArchetype, setCurrentArchetype] = useState<Archetype>("sunny");
  const [pickedMood, setPickedMood] = useState<string>("loved");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const arch = archetypes[currentArchetype];

  // Dynamic live demo data calculations (memoized to avoid re-calculating on every render)
  const closetHealth = React.useMemo(() => computeClosetHealth(DEMO_WARDROBE_ITEMS), []);
  const styleDna = React.useMemo(() => calculateStyleDna(DEMO_WARDROBE_ITEMS), []);
  const wardrobeGaps = React.useMemo(() => analyzeWardrobeGaps(DEMO_WARDROBE_ITEMS), []);

  const filteredGarments = activeFilter === "All" 
    ? DEMO_WARDROBE_ITEMS 
    : DEMO_WARDROBE_ITEMS.filter((item) => item.category.toLowerCase() === activeFilter.toLowerCase());

  const navigateToScreen = (s: ScreenName) => {
    setCurrentScreen(s);
    try {
      if (s === "home" || s === "closet" || s === "discover" || s === "profile") {
        router.push(`/(tabs)/${s}` as any);
      }
    } catch (e) {
      // safe fallback
    }
  };

  if (Platform.OS === "web") {
    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%", minHeight: "100vh", backgroundColor: "#FAF1E4" }}>
        <style>{`
          :root{
            --cream:#FAF1E4;
            --cream-deep:#F3E6D3;
            --white-soft:#FFFDF9;
            --cocoa:#4A3226;
            --cocoa-soft:#7A6152;
            --cocoa-faint:#A8927F;
            --rose:#C97B84;
            --rose-dark:#B15E68;
            --rose-pale:#F3DEE1;
            --sage:#8FA377;
            --sage-dark:#5F7A4C;
            --sage-pale:#E4EADA;
            --gold:#E3A857;
            --gold-dark:#A9762C;
            --gold-pale:#FBEBD1;
            --lilac:#B79FD6;
            --lilac-dark:#7C5FA3;
            --lilac-pale:#EEE6F5;
            --radius-lg:28px;
            --radius-md:18px;
            --radius-sm:12px;
            --shadow-soft: 0 10px 28px rgba(74,50,38,0.11), 0 2px 6px rgba(74,50,38,0.07);
            --shadow-lift: 0 16px 36px rgba(74,50,38,0.16), 0 4px 10px rgba(74,50,38,0.08);
            --user-accent: ${arch.accent};
            --user-accent-dark: ${arch.dark};
            --user-accent-pale: ${arch.pale};
            --ease: cubic-bezier(.22,1,.36,1);
          }
          *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}

          .app-viewport{
            width: 100%; max-width: 480px; min-height: 100vh;
            background: var(--white-soft); color: var(--cocoa);
            font-family: 'Nunito', sans-serif; display: flex; flex-direction: column;
            position: relative; box-shadow: var(--shadow-lift);
          }

          .screen{ display: flex; flex-direction: column; flex: 1; overflow-y: auto; padding-top: 16px; scrollbar-width: none; }
          .screen::-webkit-scrollbar{ display: none; }

          .section-pad{ padding: 0 20px; }
          .pill{ display: inline-flex; align-items: center; gap: 5px; font-weight: 800; font-size: 10.5px; padding: 6px 11px; border-radius: 999px; }
          .btn-primary{ background: var(--user-accent); color: #fff; border: none; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 14.5px; padding: 14px; border-radius: 999px; width: 100%; cursor: pointer; box-shadow: 0 10px 20px -4px color-mix(in srgb, var(--user-accent) 55%, transparent); transition: transform .15s var(--ease), box-shadow .15s var(--ease); }
          .btn-primary:active{ transform: scale(.965); box-shadow: 0 6px 12px -4px color-mix(in srgb, var(--user-accent) 55%, transparent); }
          .btn-text{ background: none; border: none; color: var(--cocoa-soft); font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 12.5px; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; margin-top: 8px; }
          .speech-bubble{ background: var(--gold-pale); border-radius: 15px 15px 15px 4px; padding: 10px 14px; font-size: 12.5px; font-weight: 700; color: var(--cocoa); max-width: 205px; box-shadow: 0 4px 10px rgba(169,118,44,0.14); }

          .bottom-nav{ margin-top: auto; display: flex; justify-content: space-around; align-items: center; padding: 12px 10px 18px; background: rgba(255, 253, 249, 0.96); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-top: 1px solid var(--cream-deep); position: sticky; bottom: 0; z-index: 100; }
          .nav-item{ display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; color: var(--cocoa-faint); background: none; border: none; cursor: pointer; padding: 5px 12px; border-radius: 12px; transition: color .15s; }
          .nav-item.active{ color: var(--user-accent-dark); }
          .nav-item svg{ stroke: currentColor; transition: transform .15s var(--ease); }
          .nav-item:active svg{ transform: scale(.88); }

          /* ONBOARDING */
          #screen-onboarding{ background: linear-gradient(180deg, var(--lilac-pale) 0%, var(--cream) 60%); }
          .progress-dots{ display: flex; gap: 6px; justify-content: center; margin: 14px 0 22px; }
          .progress-dots span{ width: 7px; height: 7px; border-radius: 50%; background: var(--cream-deep); transition: background .2s; }
          .progress-dots span.done{ background: var(--lilac-dark); }
          .quiz-q{ font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; text-align: center; margin: 0 0 20px; padding: 0 10px; line-height: 1.3; color: var(--cocoa); }
          .quiz-opt{ display: flex; align-items: center; gap: 12px; background: var(--white-soft); border: 2px solid var(--cream-deep); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 12px; cursor: pointer; font-weight: 700; font-size: 13.5px; color: var(--cocoa); transition: all .18s var(--ease); }
          .quiz-opt:hover{ border-color: var(--lilac); transform: translateY(-1px); }
          .quiz-opt.selected{ border-color: var(--lilac-dark); background: var(--lilac-pale); box-shadow: 0 6px 14px -4px rgba(124,95,163,0.28); }
          .quiz-emoji{ font-size: 20px; }

          /* HOME */
          .greeting-block{ padding: 12px 20px 16px; }
          .greeting-eyebrow{ font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--user-accent-dark); margin-bottom: 3px; }
          .greeting-main{ font-family: 'Fraunces', serif; font-weight: 700; font-size: 26px; margin: 0 0 3px; letter-spacing: -0.01em; color: var(--cocoa); }
          .greeting-sub{ font-size: 13px; color: var(--cocoa-soft); }

          .outfit-card{ margin: 18px 20px 14px; background: var(--white-soft); border-radius: var(--radius-lg); box-shadow: var(--shadow-soft); position: relative; overflow: visible; }
          .outfit-visual{ height: 196px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; background: radial-gradient(circle at 28% 18%, rgba(255,255,255,0.65), transparent 55%), linear-gradient(155deg, var(--sage-pale), var(--gold-pale)); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
          .outfit-img{ width: 100%; height: 100%; object-fit: cover; }

          .swing-tag{ position: absolute; top: -14px; right: 20px; transform: rotate(6deg) translateY(-2px); z-index: 5; filter: drop-shadow(0 8px 12px rgba(74,50,38,0.28)); }
          .swing-tag .string{ width: 1.5px; height: 15px; background: repeating-linear-gradient(180deg,#B9A88F 0 3px, transparent 3px 5px); margin: 0 auto; }
          .swing-tag .tag-body{ background: var(--user-accent); color: #fff; font-weight: 800; font-size: 11px; padding: 9px 12px 9px 16px; clip-path: polygon(15px 0, 100% 0, 100% 100%, 15px 100%, 0 50%); text-align: center; min-width: 84px; letter-spacing: .01em; }
          .swing-tag .tag-hole{ position: absolute; left: 7px; top: 50%; transform: translateY(-50%); width: 5px; height: 5px; border-radius: 50%; background: var(--white-soft); box-shadow: inset 0 1px 2px rgba(0,0,0,0.25); }

          .outfit-body{ padding: 22px 18px 18px; }
          .outfit-label{ font-family: 'Fraunces', serif; font-weight: 600; font-size: 16px; margin-bottom: 9px; color: var(--cocoa); }
          .reason-row{ display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
          .reason-pill{ background: var(--sage-pale); color: #4E5D3F; }

          .chuchu-note{ display: flex; align-items: flex-end; gap: 10px; margin: 2px 20px 16px; }
          .alt-row{ display: flex; gap: 11px; padding: 0 20px 18px; overflow-x: auto; }
          .alt-card{ min-width: 100px; background: var(--white-soft); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); padding: 9px; text-align: center; flex-shrink: 0; cursor: pointer; transition: transform .15s var(--ease); overflow: hidden; }
          .alt-card:active{ transform: scale(.95); }
          .alt-swatch{ height: 64px; border-radius: 10px; margin-bottom: 6px; background-size: cover; background-position: center; }
          .alt-conf{ font-size: 9.5px; font-weight: 800; color: var(--cocoa-soft); }

          /* CLOSET */
          .closet-header{ padding: 12px 20px 12px; }
          .health-strip{ margin: 0 20px 16px; background: var(--sage-pale); border-radius: var(--radius-md); padding: 13px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: transform .15s var(--ease); }
          .health-strip:active{ transform: scale(.98); }
          .health-strip .label{ font-size: 11.5px; font-weight: 800; color: #4E5D3F; }
          .health-strip .value{ font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px; color: #4E5D3F; }
          .filter-row{ display: flex; gap: 8px; padding: 0 20px 14px; overflow-x: auto; }
          .filter-chip{ padding: 7px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; background: var(--white-soft); border: 1.5px solid var(--cream-deep); color: var(--cocoa-soft); white-space: nowrap; flex-shrink: 0; cursor: pointer; transition: all .15s var(--ease); }
          .filter-chip.active{ background: var(--cocoa); color: #fff; border-color: var(--cocoa); }
          .closet-grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 20px 20px; }
          .cloth-card{ background: var(--white-soft); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); overflow: hidden; }
          .cloth-swatch{ height: 110px; position: relative; background-size: cover; background-position: center; }
          .cloth-badge{ position: absolute; top: 6px; left: 6px; background: rgba(255,253,249,0.95); font-size: 8.5px; font-weight: 800; padding: 3px 7px; border-radius: 999px; color: var(--gold-dark); border: 1px solid var(--cream-deep); }
          .cloth-info{ padding: 9px 10px; }
          .cloth-name{ font-size: 11.5px; font-weight: 800; color: var(--cocoa); }
          .cloth-meta{ font-size: 9.5px; color: var(--cocoa-soft); margin-top: 2px; }

          /* DISCOVER */
          .discover-header{ padding: 12px 20px 4px; }
          .discover-sub{ font-size: 12px; color: var(--cocoa-soft); padding: 0 20px 14px; line-height: 1.5; }
          .discover-section-label{ font-size: 10.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--cocoa-faint); padding: 0 20px 8px; margin-top: 6px; }
          .gap-card{ margin: 0 20px 12px; background: var(--white-soft); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); padding: 14px; display: flex; gap: 12px; align-items: center; }
          .gap-swatch{ width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0; background-size: cover; background-position: center; }
          .gap-title{ font-weight: 800; font-size: 12.5px; margin-bottom: 3px; color: var(--cocoa); }
          .gap-reason{ font-size: 10px; color: var(--sage-dark); font-weight: 700; margin-bottom: 7px; }
          .gap-actions{ display: flex; gap: 6px; }
          .gap-actions button{ font-size: 10px; font-weight: 800; padding: 6px 10px; border-radius: 999px; border: 1.5px solid var(--cream-deep); background: var(--cream); color: var(--cocoa); cursor: pointer; transition: transform .15s var(--ease); }
          .gap-actions button:active{ transform: scale(.94); }
          .gap-actions button.primary{ background: var(--cocoa); color: #fff; border-color: var(--cocoa); }

          .wish-card{ margin: 0 20px 12px; background: var(--white-soft); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); padding: 12px; display: flex; gap: 12px; align-items: center; }
          .wish-swatch{ width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0; background-size: cover; background-position: center; border: 1px solid var(--cream-deep); }
          .wish-title{ font-weight: 800; font-size: 12.5px; margin-bottom: 4px; color: var(--cocoa); }
          .wish-meta-row{ display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
          .retailer-chip{ font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 999px; background: var(--lilac-pale); color: var(--lilac-dark); }
          .wish-price{ font-size: 11.5px; font-weight: 800; color: var(--cocoa); }

          .import-hint{ margin: 0 20px 18px; border: 1.5px dashed var(--cream-deep); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; gap: 11px; }
          .import-hint-icon{ width: 34px; height: 34px; border-radius: 50%; background: var(--lilac-pale); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .import-hint-text{ font-size: 11px; color: var(--cocoa-soft); line-height: 1.5; font-weight: 600; }
          .import-hint-text b{ color: var(--cocoa); }

          .discover-note{ margin: 6px 20px 4px; font-size: 10.5px; color: var(--cocoa-soft); text-align: center; font-style: italic; line-height: 1.6; }

          /* PROFILE */
          .profile-hero{ text-align: center; padding: 12px 20px 18px; position: relative; }
          .profile-avatar{ margin: 0 auto 12px; }
          .profile-archetype{ font-family: 'Fraunces', serif; font-weight: 700; font-size: 19px; color: var(--cocoa); }
          .profile-tag{ font-size: 11.5px; color: var(--cocoa-soft); margin-top: 2px; }
          .style-bars{ padding: 4px 20px 16px; }
          .style-row{ margin-bottom: 11px; cursor: pointer; }
          .style-row .lbl{ display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 800; margin-bottom: 5px; color: var(--cocoa); }
          .style-track{ background: var(--cream-deep); border-radius: 999px; height: 8px; overflow: hidden; }
          .style-fill{ height: 100%; border-radius: 999px; background: var(--user-accent); transition: width .6s var(--ease); }
          .palette-row{ display: flex; gap: 8px; padding: 0 20px 18px; }
          .swatch-dot{ width: 30px; height: 30px; border-radius: 50%; box-shadow: 0 3px 8px rgba(74,50,38,0.16); cursor: pointer; }
          .badge-row{ display: flex; gap: 8px; padding: 0 20px 20px; flex-wrap: wrap; }
          .badge-chip{ background: var(--gold-pale); color: var(--gold-dark); font-size: 10px; font-weight: 800; padding: 6px 11px; border-radius: 999px; }

          /* CHECK-IN */
          #screen-checkin{ align-items: center; text-align: center; padding: 18px 24px; }
          .checkin-bubble{ background: var(--rose-pale); border-radius: 20px 20px 20px 4px; padding: 13px 17px; font-weight: 700; font-size: 13.5px; margin: 14px 0 20px; max-width: 245px; color: var(--cocoa); }
          .mood-row{ display: flex; gap: 10px; margin-bottom: 18px; width: 100%; }
          .mood-btn{ background: var(--white-soft); border: 2px solid var(--cream-deep); border-radius: 16px; padding: 13px 10px; font-size: 21px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; transition: all .15s var(--ease); }
          .mood-btn span.lbl{ font-size: 9.5px; font-weight: 800; color: var(--cocoa-soft); }
          .mood-btn.picked{ border-color: var(--rose); background: var(--rose-pale); transform: scale(1.03); }
          .note-box{ width: 100%; border-radius: var(--radius-md); border: 2px solid var(--cream-deep); padding: 12px; font-family: 'Nunito', sans-serif; font-size: 12.5px; resize: none; background: var(--white-soft); color: var(--cocoa); }
        `}</style>

        <div className="app-viewport">
          {/* 1. ONBOARDING SCREEN */}
          {currentScreen === "onboarding" && (
            <div className="screen" id="screen-onboarding">
              <div className="section-pad">
                <div className="progress-dots">
                  <span className="done"></span>
                  <span className="done"></span>
                  <span className="done"></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="quiz-q">Your ideal Sunday morning looks like...</div>

                <div
                  className={`quiz-opt ${currentArchetype === "dreamer" ? "selected" : ""}`}
                  onClick={() => setCurrentArchetype("dreamer")}
                >
                  <span className="quiz-emoji">🌷</span> Tea in bed, taking it slow
                </div>

                <div
                  className={`quiz-opt ${currentArchetype === "minimalist" ? "selected" : ""}`}
                  onClick={() => setCurrentArchetype("minimalist")}
                >
                  <span className="quiz-emoji">🤍</span> Quiet, tidy, no fuss
                </div>

                <div
                  className={`quiz-opt ${currentArchetype === "sunny" ? "selected" : ""}`}
                  onClick={() => setCurrentArchetype("sunny")}
                >
                  <span className="quiz-emoji">🌤️</span> Farmers market, sun on my face
                </div>

                <div
                  className={`quiz-opt ${currentArchetype === "planner" ? "selected" : ""}`}
                  onClick={() => setCurrentArchetype("planner")}
                >
                  <span className="quiz-emoji">📝</span> Already mapping out the week
                </div>
              </div>

              <div style={{ marginTop: "auto", padding: 20 }}>
                <button className="btn-primary" onClick={() => navigateToScreen("home")}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* 2. HOME SCREEN */}
          {currentScreen === "home" && (
            <div className="screen" id="screen-home">
              <div className="greeting-block">
                <div className="greeting-eyebrow">Tuesday · Morning</div>
                <div className="greeting-main">{arch.greet.greet}</div>
                <div className="greeting-sub">{arch.greet.sub}</div>
              </div>

              <div className="outfit-card">
                <div className="swing-tag">
                  <div className="tag-body">{currentArchetype === "minimalist" ? "84% Good" : "91% " + arch.greet.tag}</div>
                  <div className="tag-hole"></div>
                </div>
                <div className="outfit-visual">
                  <img src={DEMO_WARDROBE_ITEMS[0].imageUri} alt={DEMO_WARDROBE_ITEMS[0].title} className="outfit-img" />
                </div>
                <div className="outfit-body">
                  <div className="outfit-label">Today's Pick: {DEMO_WARDROBE_ITEMS[0].title}</div>
                  <div className="reason-row">
                    <span className="pill reason-pill">🌦️ Weather-right</span>
                    <span className="pill reason-pill">🎨 Your palette</span>
                    <span className="pill reason-pill">👖 Rested a while</span>
                  </div>
                  <button className="btn-primary" onClick={() => setCurrentScreen("checkin")}>
                    Wear This
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <button className="btn-text">Show another</button>
                  </div>
                </div>
              </div>

              <div className="chuchu-note">
                <svg width="44" height="44" viewBox="0 0 100 100">
                  <ellipse cx="30" cy="18" rx="8" ry="10" fill="#EAD9C4" />
                  <ellipse cx="70" cy="18" rx="8" ry="10" fill="#EAD9C4" />
                  <circle cx="50" cy="52" r="38" fill="#F3E3CC" />
                  <path d="M18 60 Q50 78 82 60 Q82 78 50 84 Q18 78 18 60Z" fill="var(--user-accent)" />
                  <circle cx="38" cy="48" r="3.4" fill="#4A3226" />
                  <circle cx="62" cy="48" r="3.4" fill="#4A3226" />
                  <circle cx="28" cy="58" r="6" fill="#E9A9AE" opacity="0.7" />
                  <circle cx="72" cy="58" r="6" fill="#E9A9AE" opacity="0.7" />
                  <path d="M42 60 Q50 66 58 60" stroke="#4A3226" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  {currentArchetype === "dreamer" && (
                    <g>
                      <path d="M42 6c2-4 8-4 8 0-2-3-6-3-8 0z" fill="#E9A9AE" />
                      <circle cx="38" cy="7" r="3" fill="#F3DEE1" />
                      <circle cx="50" cy="4" r="3" fill="#F3DEE1" />
                      <circle cx="62" cy="7" r="3" fill="#F3DEE1" />
                    </g>
                  )}
                  {currentArchetype === "minimalist" && <rect x="26" y="10" width="48" height="6" rx="3" fill="#EFE7DC" />}
                  {currentArchetype === "sunny" && (
                    <g>
                      <rect x="24" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity="0.85" />
                      <rect x="52" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity="0.85" />
                      <rect x="46" y="37" width="8" height="3" fill="#4A3226" opacity="0.85" />
                    </g>
                  )}
                  {currentArchetype === "planner" && (
                    <g>
                      <circle cx="38" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth="2" />
                      <circle cx="62" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth="2" />
                      <line x1="47" y1="48" x2="53" y2="48" stroke="#4A3226" strokeWidth="2" />
                    </g>
                  )}
                </svg>
                <div className="speech-bubble" id="chuchu-line">
                  {arch.greet.line}
                </div>
              </div>

              <div className="alt-row">
                {DEMO_WARDROBE_ITEMS.slice(1, 4).map((alt, idx) => (
                  <div key={alt.id} className="alt-card">
                    <div className="alt-swatch" style={{ backgroundImage: `url(${alt.imageUri})` }}></div>
                    <div className="alt-conf">{idx === 0 ? "84% Good" : idx === 1 ? "80% Good" : "76% Bold"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CLOSET SCREEN */}
          {currentScreen === "closet" && (
            <div className="screen" id="screen-closet">
              <div className="closet-header">
                <div className="greeting-main" style={{ fontSize: 19 }}>Your Closet 🧺</div>
                <div className="greeting-sub">{DEMO_WARDROBE_ITEMS.length} pieces, all yours</div>
              </div>
              <div className="health-strip">
                <div className="label">Closet Health</div>
                <div className="value">{Math.round(closetHealth.overall * 100)}% 🌿</div>
              </div>
              <div className="filter-row">
                {["All", "Tops", "Bottoms", "Ethnic", "Shoes"].map((f) => (
                  <div
                    key={f}
                    className={`filter-chip ${activeFilter.toLowerCase() === f.toLowerCase() ? "active" : ""}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </div>
                ))}
              </div>
              <div className="closet-grid">
                {filteredGarments.map((item) => (
                  <div key={item.id} className="cloth-card">
                    <div className="cloth-swatch" style={{ backgroundImage: `url(${item.imageUri})` }}>
                      <span className="cloth-badge">{item.demoWearCount}</span>
                    </div>
                    <div className="cloth-info">
                      <div className="cloth-name">{item.title}</div>
                      <div className="cloth-meta">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DISCOVER SCREEN */}
          {currentScreen === "discover" && (
            <div className="screen" id="screen-discover">
              <div className="discover-header">
                <div className="greeting-main" style={{ fontSize: 19 }}>A little something? 🎀</div>
              </div>
              <div className="discover-sub">Only what genuinely fills a gap — never just because.</div>

              <div className="discover-section-label">Fills a gap in your closet</div>
              {wardrobeGaps.slice(0, 1).map((gap, idx) => (
                <div key={idx} className="gap-card">
                  <div className="gap-swatch" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop&q=80)` }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="gap-title">Cream Wool Coat</div>
                    <div className="gap-reason">{gap.advice}</div>
                    <div className="gap-actions">
                      <button className="primary">Add to Wishlist</button>
                      <button>Not for me</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="discover-section-label">Saved from your wishlist</div>
              {DEMO_WISHLIST_ITEMS.map((w) => (
                <div key={w.id} className="wish-card">
                  <div className="wish-swatch" style={{ backgroundImage: `url(${w.imageUri})` }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="wish-title">{w.title}</div>
                    <div className="wish-meta-row">
                      <span className="retailer-chip">via {w.retailer}</span>
                      <span className="wish-price">{w.price}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="import-hint">
                <div className="import-hint-icon">📎</div>
                <div className="import-hint-text">
                  Found something while shopping? <b>Share it to ChuChu</b> from any app and it lands right here.
                </div>
              </div>

              <p className="discover-note">Ranked by usefulness, never by who paid for placement.</p>
            </div>
          )}

          {/* 5. PROFILE SCREEN */}
          {currentScreen === "profile" && (
            <div className="screen" id="screen-profile">
              <div className="profile-hero">
                <svg className="profile-avatar" width="58" height="58" viewBox="0 0 100 100">
                  <ellipse cx="30" cy="18" rx="8" ry="10" fill="#EAD9C4" />
                  <ellipse cx="70" cy="18" rx="8" ry="10" fill="#EAD9C4" />
                  <circle cx="50" cy="52" r="38" fill="#F3E3CC" />
                  <path d="M18 60 Q50 78 82 60 Q82 78 50 84 Q18 78 18 60Z" fill="var(--user-accent)" />
                  <circle cx="38" cy="48" r="3.4" fill="#4A3226" />
                  <circle cx="62" cy="48" r="3.4" fill="#4A3226" />
                  <circle cx="28" cy="58" r="6" fill="#E9A9AE" opacity="0.7" />
                  <circle cx="72" cy="58" r="6" fill="#E9A9AE" opacity="0.7" />
                  <path d="M40 62 Q50 68 60 62" stroke="#4A3226" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  {currentArchetype === "dreamer" && (
                    <g>
                      <path d="M42 6c2-4 8-4 8 0-2-3-6-3-8 0z" fill="#E9A9AE" />
                      <circle cx="38" cy="7" r="3" fill="#F3DEE1" />
                      <circle cx="50" cy="4" r="3" fill="#F3DEE1" />
                      <circle cx="62" cy="7" r="3" fill="#F3DEE1" />
                    </g>
                  )}
                  {currentArchetype === "minimalist" && <rect x="26" y="10" width="48" height="6" rx="3" fill="#EFE7DC" />}
                  {currentArchetype === "sunny" && (
                    <g>
                      <rect x="24" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity="0.85" />
                      <rect x="52" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity="0.85" />
                      <rect x="46" y="37" width="8" height="3" fill="#4A3226" opacity="0.85" />
                    </g>
                  )}
                  {currentArchetype === "planner" && (
                    <g>
                      <circle cx="38" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth="2" />
                      <circle cx="62" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth="2" />
                      <line x1="47" y1="48" x2="53" y2="48" stroke="#4A3226" strokeWidth="2" />
                    </g>
                  )}
                </svg>
                <div className="profile-archetype" id="profile-archetype">{arch.name}</div>
                <div className="profile-tag">Style DNA · updated today</div>
              </div>

              <div className="style-bars">
                <div className="style-row">
                  <div className="lbl"><span>{styleDna.primaryStyle}</span><span>{styleDna.primaryPct}%</span></div>
                  <div className="style-track"><div className="style-fill" style={{ width: `${styleDna.primaryPct}%` }}></div></div>
                </div>
                <div className="style-row">
                  <div className="lbl"><span>{styleDna.secondaryStyle}</span><span>{styleDna.secondaryPct}%</span></div>
                  <div className="style-track"><div className="style-fill" style={{ width: `${styleDna.secondaryPct}%`, opacity: 0.72 }}></div></div>
                </div>
                <div className="style-row">
                  <div className="lbl"><span>{styleDna.accentStyle}</span><span>{styleDna.accentPct}%</span></div>
                  <div className="style-track"><div className="style-fill" style={{ width: `${styleDna.accentPct}%`, opacity: 0.45 }}></div></div>
                </div>
              </div>

              <div className="palette-row">
                {DEMO_WARDROBE_ITEMS.slice(0, 4).map((i) => (
                  <div key={i.id} className="swatch-dot" style={{ background: i.dominantColor }}></div>
                ))}
              </div>

              <div className="badge-row">
                <span className="badge-chip">🔥 12-day streak</span>
                <span className="badge-chip">🌿 {Math.round(closetHealth.overall * 100)}% Closet Health</span>
                <span className="badge-chip">🤍 Trusted 91% of picks</span>
              </div>
            </div>
          )}

          {/* 6. CHECK-IN SCREEN */}
          {currentScreen === "checkin" && (
            <div className="screen" id="screen-checkin">
              <svg width="64" height="64" viewBox="0 0 100 100" style={{ marginTop: 22 }}>
                <ellipse cx="30" cy="18" rx="8" ry="10" fill="#EAD9C4" />
                <ellipse cx="70" cy="18" rx="8" ry="10" fill="#EAD9C4" />
                <circle cx="50" cy="52" r="38" fill="#F3E3CC" />
                <path d="M18 60 Q50 78 82 60 Q82 78 50 84 Q18 78 18 60Z" fill="var(--user-accent)" />
                <circle cx="38" cy="48" r="3.4" fill="#4A3226" />
                <circle cx="62" cy="48" r="3.4" fill="#4A3226" />
                <circle cx="28" cy="58" r="6" fill="#E9A9AE" opacity="0.7" />
                <circle cx="72" cy="58" r="6" fill="#E9A9AE" opacity="0.7" />
                <path d="M40 62 Q50 70 60 62" stroke="#4A3226" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {currentArchetype === "dreamer" && (
                  <g>
                    <path d="M42 6c2-4 8-4 8 0-2-3-6-3-8 0z" fill="#E9A9AE" />
                    <circle cx="38" cy="7" r="3" fill="#F3DEE1" />
                    <circle cx="50" cy="4" r="3" fill="#F3DEE1" />
                    <circle cx="62" cy="7" r="3" fill="#F3DEE1" />
                  </g>
                )}
                {currentArchetype === "minimalist" && <rect x="26" y="10" width="48" height="6" rx="3" fill="#EFE7DC" />}
                {currentArchetype === "sunny" && (
                  <g>
                    <rect x="24" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity="0.85" />
                    <rect x="52" y="34" width="24" height="9" rx="4" fill="#4A3226" opacity="0.85" />
                    <rect x="46" y="37" width="8" height="3" fill="#4A3226" opacity="0.85" />
                  </g>
                )}
                {currentArchetype === "planner" && (
                  <g>
                    <circle cx="38" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth="2" />
                    <circle cx="62" cy="48" r="9" fill="none" stroke="#4A3226" strokeWidth="2" />
                    <line x1="47" y1="48" x2="53" y2="48" stroke="#4A3226" strokeWidth="2" />
                  </g>
                )}
              </svg>

              <div className="checkin-bubble">How'd today's fit feel?</div>

              <div className="mood-row">
                <button
                  className={`mood-btn ${pickedMood === "loved" ? "picked" : ""}`}
                  onClick={() => setPickedMood("loved")}
                >
                  😍<span className="lbl">Loved it</span>
                </button>
                <button
                  className={`mood-btn ${pickedMood === "fine" ? "picked" : ""}`}
                  onClick={() => setPickedMood("fine")}
                >
                  😌<span className="lbl">It's fine</span>
                </button>
                <button
                  className={`mood-btn ${pickedMood === "not_quite" ? "picked" : ""}`}
                  onClick={() => setPickedMood("not_quite")}
                >
                  😕<span className="lbl">Not quite</span>
                </button>
              </div>

              <textarea className="note-box" rows={3} placeholder="Tell ChuChu more (optional)"></textarea>

              <div style={{ marginTop: 16, width: "100%" }}>
                <button className="btn-primary" onClick={() => navigateToScreen("home")}>
                  Save &amp; carry on
                </button>
              </div>
            </div>
          )}

          {/* STICKY BOTTOM NAVIGATION BAR */}
          {currentScreen !== "onboarding" && (
            <div className="bottom-nav">
              <button
                className={`nav-item ${currentScreen === "home" ? "active" : ""}`}
                onClick={() => navigateToScreen("home")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>Home
              </button>
              <button
                className={`nav-item ${currentScreen === "closet" ? "active" : ""}`}
                onClick={() => navigateToScreen("closet")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M12 3l-2 3h4l-2-3z" /><path d="M12 6c-4 2-8 4-8 8v6h16v-6c0-4-4-6-8-8z" /></svg>Closet
              </button>
              <button
                className={`nav-item ${currentScreen === "discover" ? "active" : ""}`}
                onClick={() => navigateToScreen("discover")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M12 2l1.6 5.3L19 9l-5.4 1.7L12 16l-1.6-5.3L5 9l5.4-1.7z" /></svg>Discover
              </button>
              <button
                className={`nav-item ${currentScreen === "profile" ? "active" : ""}`}
                onClick={() => navigateToScreen("profile")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>Me
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <View style={styles.nativeWrap}>
      <Text style={styles.nativeTitle}>ChuChu — {currentScreen.toUpperCase()}</Text>
      <Text style={styles.nativeSub}>{arch.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeWrap: {
    flex: 1,
    backgroundColor: colors.whiteSoft,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  nativeTitle: {
    fontFamily: "Fraunces-SemiBold",
    fontSize: 22,
    color: colors.cocoa,
  },
  nativeSub: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: colors.cocoaSoft,
  },
});
