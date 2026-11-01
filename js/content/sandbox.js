// Sandbox starting points: free-play worlds built from the same pieces as the lessons.

import { notesApi } from './r04-http.js';
import { tlsSite } from './r05-security.js';
import { foundationEdge } from './r08-saas.js';
import { writeMini } from './foundation-mini.js';

const DAY = 86400;

export const SCENARIOS = {
  laptop: {
    title: 'Just your laptop',
    note: 'A Linux laptop with git, jq and dig. Try: ls -la, mkdir demo && cd demo && git init, echo \'{"a":[1,2]}\' | jq .a',
    setup(H) {
      H.write('laptop', '~/notes.txt', 'Things to learn:\n- the terminal\n- git\n- HTTP\n', { owner: 'dev' });
    },
    panels: ['files', 'git'],
  },
  http: {
    title: 'HTTP playground',
    note: 'The Notes API at https://api.acme.example.com/v1/notes (token in ~/token.txt). Try: curl -i …/v1/notes, then POST, PATCH and DELETE with -H "Authorization: Bearer $(cat ~/token.txt)"',
    setup(H) {
      notesApi(H);
      H.write('laptop', '~/token.txt', 'nt_' + 'live_7c1f0e2a9b\n', { owner: 'dev', mode: 0o600 });
    },
    panels: ['network'],
  },
  tls: {
    title: 'HTTPS lab',
    note: 'Four HTTPS sites: good, old, wrong and self .example.com. Try: curl -I https://old.example.com, openssl s_client -connect wrong.example.com:443 -servername wrong.example.com',
    setup(H) {
      const now = H.uni.time;
      tlsSite(H, 'good.example.com', { cn: 'good.example.com', sans: ['good.example.com'], issuer: "Let's Encrypt R11", notBefore: now - 30 * DAY, notAfter: now + 60 * DAY });
      tlsSite(H, 'old.example.com', { cn: 'old.example.com', sans: ['old.example.com'], issuer: "Let's Encrypt R11", notBefore: now - 95 * DAY, notAfter: now - 3 * DAY });
      tlsSite(H, 'wrong.example.com', { cn: 'www.othershop.example', sans: ['www.othershop.example'], issuer: 'DigiCert Global G2', notBefore: now - 30 * DAY, notAfter: now + 300 * DAY });
      tlsSite(H, 'self.example.com', { cn: 'self.example.com', sans: ['self.example.com'], issuer: 'self.example.com', selfSigned: true, notBefore: now - DAY, notAfter: now + 365 * DAY });
    },
    panels: ['network'],
  },
  tenants: {
    title: 'Multi-tenant edge',
    note: 'acme. and globex.foundation.example.com share one IP. Try: curl -s https://acme.foundation.example.com/v1/tenants/current, then the same IP with -H "Host: globex.foundation.example.com"',
    setup(H) { foundationEdge(H); },
    panels: ['network'],
  },
  foundation: {
    title: 'SaaS-Foundation miniature',
    note: 'The course\'s illustrative miniature of the codebase in ~/saas-foundation. Try: cat CLAUDE.md, grep -rn "def notify" python, ls modules',
    setup(H) { writeMini(H); },
    panels: ['files', 'git'],
  },
};
