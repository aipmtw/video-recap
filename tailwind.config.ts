import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          'system-ui',
          'sans-serif'
        ],
        serif: [
          '"Noto Serif TC"',
          '"Source Han Serif TC"',
          'Georgia',
          'serif'
        ]
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '70ch',
            lineHeight: '1.85'
          }
        }
      }
    }
  },
  plugins: []
};

export default config;
