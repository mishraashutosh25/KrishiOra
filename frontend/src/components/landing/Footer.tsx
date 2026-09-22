import type { ComponentType, ReactNode } from "react";

import {
  ArrowUpRight,
  Mail,
  MapPin,
  Sprout,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import { useTranslation } from "../../hooks/useTranslation";
import type { LangCode } from "../../i18n/translations";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  href?: string;
  icon: ComponentType<{ size?: number }>;
}

/* -------------------------------------------------------------------------- */
/* Assets                                                                     */
/* -------------------------------------------------------------------------- */

const ASSETS = {
  logo: "/krishiora-logo.png",
  farm: "/footer-farm.jpg",
  texture: "/field-row-texture.svg",
};


/* -------------------------------------------------------------------------- */
/* Social Links                                                               */
/* -------------------------------------------------------------------------- */

/*
 * Replace these with your REAL KrishiOra social URLs.
 */

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    label: "X",
    icon: FaXTwitter,
  },
  {
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    label: "Facebook",
    icon: FaFacebookF,
  },
];

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CURRENT_YEAR = new Date().getFullYear();

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

const Footer = () => {
  const { t, setLang, supportedLanguages } = useTranslation();

  const productLinks: FooterLink[] = [
    { label: t.nav.featItems.farmManagement.title, href: "#features" },
    { label: t.nav.featItems.cropLifecycle.title, href: "#features" },
    { label: t.nav.featItems.expenseIntelligence.title, href: "#features" },
    { label: t.nav.featItems.farmAnalytics.title, href: "#features" },
  ];

  const companyLinks: FooterLink[] = [
    { label: "About Us", href: "/about" },
    { label: t.nav.whyKrishiOra, href: "#problem-solution" },
    { label: t.nav.howItWorks, href: "#how-it-works" },
    { label: t.footer.languages, href: "#languages" },
  ];

  const legalLinks: FooterLink[] = [
    { label: t.footer.privacyPolicy, href: "/privacy" },
    { label: t.footer.termsOfUse, href: "/terms" },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      aria-label="KrishiOra footer"
      className="
        relative isolate overflow-hidden
        border-t border-white/[0.06]
        bg-[#040b07]
        text-white
      "
    >
      {/* ================================================================== */}
      {/* BACKGROUND                                                          */}
      {/* ================================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Farm image */}
        <div
          className="
            absolute -inset-8
            bg-cover bg-center
            opacity-[0.28]
            blur-[2px]
          "
          style={{
            backgroundImage: `url("${ASSETS.farm}")`,
          }}
        />

        {/* Dark cinematic overlay */}
        <div
          className="
            absolute inset-0
            bg-[#020604]/48
          "
        />

        {/* Top readability */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-[#020604]/55
            via-[#04100a]/35
            to-[#030a06]/94
          "
        />

        {/* Horizontal fade */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-[#020604]/58
            via-transparent
            to-[#020604]/48
          "
        />

        {/* Atmospheric glow */}
        <div
          className="
            absolute -left-40 -top-40
            h-[420px] w-[420px]
            rounded-full
            bg-emerald-300/[0.045]
            blur-[120px]
          "
        />

        <div
          className="
            absolute -right-40 bottom-[-160px]
            h-[440px] w-[440px]
            rounded-full
            bg-emerald-200/[0.035]
            blur-[130px]
          "
        />

        {/* Field texture */}
        <div
          className="absolute inset-0 bg-repeat opacity-[0.025]"
          style={{
            backgroundImage: `url("${ASSETS.texture}")`,
          }}
        />
      </div>

      {/* ================================================================== */}
      {/* TOP ACCENT LINE                                                     */}
      {/* ================================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute inset-x-0 top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/15
          to-transparent
        "
      />

      {/* ================================================================== */}
      {/* MAIN FOOTER CONTENT                                                 */}
      {/* ================================================================== */}

      <div
        className="
          relative mx-auto w-full max-w-7xl
          px-8
          py-8
          lg:px-12 lg:py-12
          xl:px-16
        "
      >
        <div
          className="
            grid grid-cols-1
            gap-10
            sm:gap-12
            md:grid-cols-2
            lg:grid-cols-[1.55fr_0.85fr_0.85fr_1fr]
            lg:gap-12
            xl:gap-16
          "
        >
          {/* ================================================================ */}
          {/* BRAND                                                             */}
          {/* ================================================================ */}

          <div className="max-w-[430px]">
            {/* Brand */}
            <a
              href="/"
              aria-label="KrishiOra home"
              className="
                group inline-flex items-center gap-3
                rounded-2xl
                outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-300/70
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#040b07]
              "
            >
              {/* Logo container */}
              <div
                className="
                  flex h-14 w-14 shrink-0
                  items-center justify-center
                  overflow-hidden rounded-2xl
                  border border-white/10
                  bg-white/[0.035]
                  p-1.5
                  shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                  backdrop-blur-md
                  transition-all duration-300
                  group-hover:border-white/20
                  group-hover:bg-white/[0.06]
                  group-hover:shadow-[0_10px_35px_rgba(0,0,0,0.28)]
                "
              >
                <img
                  src={ASSETS.logo}
                  alt="KrishiOra logo"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="
                    h-full w-full
                    object-contain
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                />
              </div>

              {/* Brand text */}
              <div className="flex flex-col leading-none">
                <span
                  className="
                    text-[24px]
                    font-extrabold
                    tracking-[-0.045em]
                    text-white
                  "
                >
                  KrishiOra
                </span>

                <span
                  className="
                    mt-1.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-emerald-300/90
                  "
                >
                  Smart Agriculture
                </span>
              </div>
            </a>

            <div
              aria-hidden="true"
              className="
                mt-5 h-px w-16
                bg-gradient-to-r
                from-emerald-300/60
                to-transparent
              "
            />

            {/* Description */}
            <p
              className="
                mt-6
                max-w-[380px]
                text-[13.5px]
                leading-6
                text-white/[0.56]
              "
            >
              {t.footer.description}
            </p>

            {/* ============================================================ */}
            {/* FEATURE BADGES                                                */}
            {/* ============================================================ */}

            <div
              className="
                mt-5
                flex max-w-[410px]
                flex-wrap gap-2
              "
            >
              <FooterBadge icon={<Sprout size={13} />}>
                Smart Farming
              </FooterBadge>

              <FooterBadge icon={<span>₹</span>}>
                Expense Tracking
              </FooterBadge>

              <FooterBadge icon={<span>⌁</span>}>
                Smart Analytics
              </FooterBadge>

              <FooterBadge icon={<span>✓</span>}>
                Farmer Friendly
              </FooterBadge>
            </div>

            {/* ============================================================ */}
            {/* CONTACT                                                       */}
            {/* ============================================================ */}

            <div className="mt-6 space-y-2.5">
              <a
                href="mailto:hello@krishiora.com"
                className="
                  group inline-flex
                  items-center gap-2.5
                  rounded-lg
                  text-sm
                  text-white/55
                  outline-none
                  transition-colors duration-200
                  hover:text-white
                  focus-visible:ring-2
                  focus-visible:ring-emerald-300/70
                "
              >
                <Mail
                  size={15}
                  aria-hidden="true"
                  className="
                    shrink-0
                    text-white/65
                    transition-colors
                    group-hover:text-emerald-300
                  "
                />

                <span>hello@krishiora.com</span>
              </a>

              <div
                className="
                  flex items-center gap-2.5
                  text-sm text-white/[0.40]
                "
              >
                <MapPin
                  size={15}
                  aria-hidden="true"
                  className="shrink-0 text-white/55"
                />

                <span>{t.footer.madeFor}</span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SOCIAL                                                        */}
            {/* ============================================================ */}

            <div
              className="
                mt-6 flex items-center gap-2
              "
              aria-label="KrishiOra social media"
            >
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => {
                const className = `
                  flex h-10 w-10 items-center justify-center
                  rounded-xl border border-white/10
                  bg-white/[0.025] text-white/45
                  shadow-sm backdrop-blur-md outline-none
                  transition-all duration-200
                  focus-visible:ring-2
                  focus-visible:ring-emerald-300/70
                  ${href
                    ? "hover:-translate-y-1 hover:border-emerald-300/20 hover:bg-emerald-300/[0.06] hover:text-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.22)]"
                    : "cursor-not-allowed opacity-70"}
                `;

                if (!href) {
                  return (
                    <span
                      key={label}
                      role="img"
                      aria-label={`${label} profile link not configured`}
                      title={`${label} link coming soon`}
                      className={className}
                    >
                      <Icon size={15} aria-hidden="true" />
                    </span>
                  );
                }

                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`KrishiOra on ${label}`}
                    className={className}
                  >
                    <Icon size={15} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ================================================================ */}
          {/* PRODUCT                                                           */}
          {/* ================================================================ */}

          <FooterColumn
            title={t.footer.product}
            links={productLinks}
          />

          {/* ================================================================ */}
          {/* COMPANY                                                           */}
          {/* ================================================================ */}

          <FooterColumn
            title={t.footer.company}
            links={companyLinks}
          />

          {/* ================================================================ */}
          {/* LANGUAGES                                                         */}
          {/* ================================================================ */}

          <div id="languages">
            <FooterHeading>{t.footer.languages}</FooterHeading>

            <p
              className="
                mt-4 max-w-[280px]
                text-[13px]
                leading-6
                text-white/[0.45]
              "
            >
              {t.footer.langDesc}
            </p>

            {/* Language pills */}
            <div
              className="
                mt-5
                flex max-w-[310px]
                flex-wrap gap-2
              "
            >
              {supportedLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code as LangCode)}
                  className="
                    rounded-lg
                    border border-white/10
                    bg-white/[0.035]
                    px-2.5 py-1.5
                    text-[11px]
                    font-medium
                    text-white/70
                    backdrop-blur-md
                    transition-all duration-200
                    hover:border-emerald-300/40
                    hover:bg-emerald-300/[0.1]
                    hover:text-white
                  "
                >
                  <span className="mr-1">{l.flag}</span>
                  <span>{l.native}</span>
                </button>
              ))}
            </div>

            {/* ================================================================ */}
            {/* NEWSLETTER                                                        */}
            {/* ================================================================ */}
            <div className="mt-10">
              <FooterHeading>Stay Updated</FooterHeading>
              <p className="mt-4 max-w-[280px] text-[13px] leading-6 text-white/[0.45]">
                Get seasonal farming tips and KrishiOra updates directly to your inbox.
              </p>
              <form 
                className="mt-4 flex max-w-[280px] items-center rounded-lg border border-white/10 bg-white/[0.035] p-1 backdrop-blur-md transition-all focus-within:border-emerald-300/50 focus-within:ring-1 focus-within:ring-emerald-300/50 hover:bg-white/[0.05]"
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  const form = e.target as HTMLFormElement;
                  const btn = form.querySelector('button');
                  if(btn) {
                    const original = btn.innerText;
                    btn.innerText = "Subscribed!";
                    btn.classList.add("bg-emerald-500/40", "text-emerald-200");
                    setTimeout(() => {
                      btn.innerText = original;
                      btn.classList.remove("bg-emerald-500/40", "text-emerald-200");
                      form.reset();
                    }, 3000);
                  }
                }}
              >
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  required
                  className="w-full bg-transparent px-3 py-1.5 text-[13px] text-white placeholder:text-white/30 outline-none"
                />
                <button 
                  type="submit"
                  className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-[11px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/30"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* BOTTOM BAR                                                          */}
      {/* ================================================================== */}

      <div className="border-t border-white/[0.08]">
        <div
          className="
            mx-auto flex min-h-[50px]
            w-full max-w-7xl
            flex-col
            items-center
            justify-between
            gap-3
            px-5 py-4
            sm:flex-row
            sm:gap-8
            sm:px-8
            lg:px-12 xl:px-16
          "
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Copyright */}
            <p
              className="
                text-center
                text-[11px]
                leading-5
                text-white/[0.48]
                sm:shrink-0
                sm:whitespace-nowrap
              "
            >
              © {CURRENT_YEAR} KrishiOra. {t.footer.allRights}
            </p>

            {/* System Status Indicator (Industry Standard) */}
            <a 
              href="#"
              onClick={(e) => e.preventDefault()}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 backdrop-blur-sm transition-colors hover:bg-white/[0.06]"
              title="View system status"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-medium text-white/50 transition-colors group-hover:text-white/70">
                All systems operational
              </span>
            </a>
          </div>

          {/* Right actions */}
          <div
            className="
              flex flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-3
              sm:ml-auto
              sm:gap-6
            "
          >
            {/* Legal */}
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  whitespace-nowrap
                  rounded-md
                  text-[11px]
                  leading-5
                  text-white/[0.52]
                  outline-none
                  transition-colors duration-200
                  hover:text-white/80
                  focus-visible:ring-2
                  focus-visible:ring-emerald-300/70
                "
              >
                {link.label}
              </a>
            ))}

            {/* Divider */}
            <span
              aria-hidden="true"
              className="
                hidden h-4 w-px
                shrink-0
                bg-white/10
                sm:block
              "
            />

            {/* Back to top */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="
                group
                inline-flex
                shrink-0
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-md
                text-[11px]
                font-medium
                text-white/[0.48]
                outline-none
                transition-colors duration-200
                hover:text-white
                focus-visible:ring-2
                focus-visible:ring-emerald-300/70
              "
            >
              <span>{t.footer.backToTop}</span>

              <ArrowUpRight
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  transition-transform duration-200
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};


/* -------------------------------------------------------------------------- */
/* Footer Heading                                                             */
/* -------------------------------------------------------------------------- */

interface FooterHeadingProps {
  children: ReactNode;
}

const FooterHeading = ({
  children,
}: FooterHeadingProps) => {
  return (
    <h3
      className="
        text-[12px]
        font-semibold
        tracking-[0.08em]
        text-white/90
      "
    >
      {children}
    </h3>
  );
};

/* -------------------------------------------------------------------------- */
/* Footer Column                                                              */
/* -------------------------------------------------------------------------- */

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

const FooterColumn = ({
  title,
  links,
}: FooterColumnProps) => {
  return (
    <nav aria-label={title}>
      <FooterHeading>{title}</FooterHeading>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-md
                text-[13px]
                leading-6
                text-white/[0.55]
                outline-none
                transition-all duration-200
                hover:translate-x-0.5
                hover:text-white
                focus-visible:ring-2
                focus-visible:ring-emerald-300/70
              "
            >
              <span>{link.label}</span>

              <ArrowUpRight
                size={11}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  -translate-x-1
                  opacity-0
                  transition-all duration-200
                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/* Footer Badge                                                               */
/* -------------------------------------------------------------------------- */

interface FooterBadgeProps {
  icon: ReactNode;
  children: ReactNode;
}

const FooterBadge = ({
  icon,
  children,
}: FooterBadgeProps) => {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-lg
        border border-white/10
        bg-white/[0.025]
        px-3 py-1.5
        text-[10px]
        font-medium
        text-white/[0.52]
        shadow-sm
        backdrop-blur-md
        transition-all duration-200
        hover:border-white/20
        hover:bg-white/[0.06]
        hover:text-white/80
      "
    >
      <span
        aria-hidden="true"
        className="text-emerald-300/75"
      >
        {icon}
      </span>

      {children}
    </span>
  );
};

export default Footer;
