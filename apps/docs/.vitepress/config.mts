import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Almanac',
  description: 'The Ultimate Directory & Launcher for Essential Linux Software',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#10b981' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Almanac Docs',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Shortcuts', link: '/guide/keyboard-shortcuts' },
      { text: 'Catalog', link: '/catalog/categories' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Contribute', link: '/catalog/contributing-apps' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation Guide', link: '/guide/installation' },
            { text: 'Neovim Keyboard Navigation', link: '/guide/keyboard-shortcuts' },
            { text: 'Configuration & Local State', link: '/guide/configuration' },
          ],
        },
      ],
      '/catalog/': [
        {
          text: 'Software Catalog',
          items: [
            { text: '14 Core Categories', link: '/catalog/categories' },
            { text: 'Supported Package Managers', link: '/catalog/package-managers' },
            { text: 'Adding Software Entries', link: '/catalog/contributing-apps' },
            { text: 'Data Schema Format', link: '/catalog/data-format' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture & Internals',
          items: [
            { text: 'Monorepo Architecture', link: '/architecture/overview' },
            { text: 'Tauri & Rust Native Layer', link: '/architecture/tauri-rust-bridge' },
            { text: 'React & State Engine', link: '/architecture/frontend' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nishu-murmu/almanac' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Almanac Contributors',
    },
    search: {
      provider: 'local',
    },
  },
})
