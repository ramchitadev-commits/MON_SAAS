// Design tokens pour Doolé — Flat & Notion
// À utiliser pour assurer la cohérence visuelle sur toute l'app

export const COLORS = {
  // Primaire : Noir (CTA principal, bordures, texte fort)
  primary: {
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-black',
    hover: 'hover:bg-slate-800',
    shadow: 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
    shadowHover: 'hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  },

  // Secondaire : Émeraude (actions, confirmations, accents positifs)
  secondary: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-600',
    hover: 'hover:bg-emerald-700',
    shadow: 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
    shadowHover: 'hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  },

  // Accent Wave (Wave paiements)
  wave: {
    bg: 'bg-[#00A3E0]',
    text: 'text-white',
    border: 'border-black',
    hover: 'hover:bg-[#0092c9]',
    shadow: 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
  },

  // Accent Orange Money
  orangeMoney: {
    bg: 'bg-black',
    text: 'text-[#FF6600]',
    border: 'border-black',
    hover: 'hover:bg-slate-950',
    shadow: 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
  },

  // Danger / Erreur
  danger: {
    bg: 'bg-rose-600',
    text: 'text-white',
    border: 'border-rose-600',
    hover: 'hover:bg-rose-700',
  },

  // Neutre / Secondaire
  neutral: {
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-slate-200',
  },

  // Fond
  background: {
    main: 'bg-[#FCFCFB]',
    secondary: 'bg-slate-100',
    card: 'bg-white',
  },
};

// Exports de classes Tailwind réutilisables pour boutons, cartes, etc.
export const BUTTON_PRIMARY = `h-12 w-full ${COLORS.primary.bg} ${COLORS.primary.text} font-bold px-6 border-2 ${COLORS.primary.border} rounded-xl ${COLORS.primary.shadow} ${COLORS.primary.hover} ${COLORS.primary.shadowHover} active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer`;

export const BUTTON_SECONDARY = `h-12 w-full ${COLORS.secondary.bg} ${COLORS.secondary.text} font-bold px-6 border-2 ${COLORS.secondary.border} rounded-xl ${COLORS.secondary.shadow} ${COLORS.secondary.hover} ${COLORS.secondary.shadowHover} active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer`;

export const BUTTON_WAVE = `h-16 w-full ${COLORS.wave.bg} ${COLORS.wave.text} border-2 ${COLORS.wave.border} rounded-2xl ${COLORS.wave.shadow} ${COLORS.wave.hover} active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer`;

export const BUTTON_ORANGE_MONEY = `h-16 w-full ${COLORS.orangeMoney.bg} ${COLORS.orangeMoney.text} border-2 ${COLORS.orangeMoney.border} rounded-2xl ${COLORS.orangeMoney.shadow} ${COLORS.orangeMoney.hover} active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer`;

export const CARD_FLAT = `bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`;

export const CARD_NOTION = `bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4`;

export const INPUT_FIELD = `w-full h-12 px-4 ${COLORS.background.card} border-2 ${COLORS.primary.border} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all`;
