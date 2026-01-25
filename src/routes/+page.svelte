<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  // Theme management
  type Theme = 'light' | 'dark' | 'system'
  let currentTheme: Theme = 'system'
  let resolvedTheme: 'light' | 'dark' = 'light'

  function getSystemTheme(): 'light' | 'dark' {
    if (browser) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  function applyTheme(theme: Theme) {
    if (!browser) return

    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
    resolvedTheme = effectiveTheme

    // Apply to document
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark')
    localStorage.setItem('theme', theme)
  }

  function cycleTheme() {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(currentTheme)
    currentTheme = themes[(currentIndex + 1) % themes.length]
    applyTheme(currentTheme)
  }

  onMount(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as Theme | null
    currentTheme = savedTheme || 'system'
    applyTheme(currentTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (currentTheme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  })
</script>

<svelte:head>
  <title>{$_('app.name')} - {$_('landing.title')}</title>
  <!-- Inline script to prevent flash of wrong theme -->
  {@html `<script>
    (function() {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = saved === 'dark' || (saved !== 'light' && prefersDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    })();
  </script>`}
</svelte:head>

<div class="min-h-screen bg-surface-50 text-surface-900 selection:bg-accent/30 transition-colors duration-300">
  <!-- Navigation -->
  <nav
    class="fixed top-0 w-full z-50 bg-surface-50/80 backdrop-blur-md border-b border-surface-200 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 group">
        <div
          class="w-8 h-8 bg-gradient-to-br from-accent to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow duration-300"
        >
          <img src="/icons/icon.svg" alt="" class="w-8 h-8 inline-block" />
        </div>
        <span class="font-display font-bold text-xl tracking-tight hidden sm:inline">{$_('app.name')}</span>
      </a>

      <!-- Right side actions -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Theme Toggle Button -->
        <button
          on:click={cycleTheme}
          class="relative w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center hover:bg-surface-200 transition-all duration-300 group"
          aria-label="Toggle theme"
          title={currentTheme === 'system' ? 'System theme' : currentTheme === 'dark' ? 'Dark mode' : 'Light mode'}
        >
          {#if currentTheme === 'light'}
            <svg
              class="w-5 h-5 text-amber-500 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          {:else if currentTheme === 'dark'}
            <svg
              class="w-5 h-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          {:else}
            <svg
              class="w-5 h-5 text-surface-500 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          {/if}
          {#if currentTheme === 'system'}
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface-50"
            ></span>
          {/if}
        </button>

        <!-- Sign In Link -->
        <a
          href="/signin"
          class="hidden xs:block text-sm font-medium text-surface-600 hover:text-accent transition-colors"
        >
          {$_('auth.signIn')}
        </a>

        <!-- CTA Button -->
        <a href="/signin" class="btn-primary btn-sm">{$_('landing.startNow')}</a>
      </div>
    </div>
  </nav>

  <main>
    <!-- Hero Section -->
    <section class="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          class="absolute -top-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
        ></div>
        <div class="absolute top-1/2 -left-24 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-4xl mx-auto text-center relative z-10">
        <!-- Badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in"
        >
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          {$_('landing.badge')}
        </div>

        <!-- Heading -->
        <h1
          class="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight animate-slide-up"
        >
          {$_('landing.heroTitle')}
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600"
            >{$_('landing.heroHighlight')}</span
          >
          {$_('landing.heroTitleEnd')}
        </h1>

        <!-- Subtitle -->
        <p
          class="text-lg sm:text-xl text-surface-500 mb-8 sm:mb-10 max-w-2xl mx-auto animate-slide-up px-4"
          style="animation-delay: 0.1s;"
        >
          {$_('landing.heroSubtitle')}
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
          style="animation-delay: 0.2s;"
        >
          <a href="/signin" class="btn-primary btn-lg w-full sm:w-auto shadow-xl shadow-accent/20">
            {$_('landing.heroCta')}
          </a>
          <a href="#metodo" class="text-sm font-semibold text-surface-500 hover:text-accent transition-colors">
            {$_('landing.learnMore')}
          </a>
        </div>
      </div>
    </section>

    <!-- The Method Section -->
    <section id="metodo" class="py-16 sm:py-24 px-4 sm:px-6 bg-surface-100/50 transition-colors duration-300">
      <div class="max-w-5xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Text Content -->
          <div class="order-2 lg:order-1">
            <h2 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-6">{$_('landing.methodTitle')}</h2>
            <div class="space-y-4 text-surface-500 text-base sm:text-lg">
              <p>
                {$_('landing.methodP1')}
                <strong class="text-surface-900">{$_('landing.methodP1Strong')}</strong>.
              </p>
              <p>
                {$_('landing.methodP2')}
                <em class="text-surface-900 not-italic font-medium">"{$_('landing.methodP2Quote')}"</em>.
              </p>
              <p>
                {$_('landing.methodP3')}
              </p>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="order-1 lg:order-2 grid grid-cols-2 gap-3 sm:gap-4">
            <div class="card-hover p-4 sm:p-6">
              <div class="text-2xl sm:text-3xl mb-3 sm:mb-4">🧠</div>
              <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">{$_('landing.card1Title')}</h3>
              <p class="text-xs sm:text-sm text-surface-500">{$_('landing.card1Desc')}</p>
            </div>
            <div class="card-hover p-4 sm:p-6">
              <div class="text-2xl sm:text-3xl mb-3 sm:mb-4">⚡</div>
              <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">{$_('landing.card2Title')}</h3>
              <p class="text-xs sm:text-sm text-surface-500">{$_('landing.card2Desc')}</p>
            </div>
            <div class="card-hover p-4 sm:p-6">
              <div class="text-2xl sm:text-3xl mb-3 sm:mb-4">📈</div>
              <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">{$_('landing.card3Title')}</h3>
              <p class="text-xs sm:text-sm text-surface-500">{$_('landing.card3Desc')}</p>
            </div>
            <div class="card-hover p-4 sm:p-6">
              <div class="text-2xl sm:text-3xl mb-3 sm:mb-4">🎯</div>
              <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">{$_('landing.card4Title')}</h3>
              <p class="text-xs sm:text-sm text-surface-500">{$_('landing.card4Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Protocol Section -->
    <section class="py-16 sm:py-24 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12 sm:mb-16">
          <h2 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-4">{$_('landing.protocolTitle')}</h2>
          <p class="text-surface-500">{$_('landing.protocolSubtitle')}</p>
        </div>

        <div class="space-y-8 sm:space-y-12">
          <!-- Step 1 -->
          <div class="flex gap-4 sm:gap-6 items-start">
            <div
              class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-accent/30"
            >
              1
            </div>
            <div class="pt-1">
              <h3 class="font-display font-bold text-xl sm:text-2xl mb-2">{$_('landing.step1Title')}</h3>
              <p class="text-surface-500 text-sm sm:text-base">
                {$_('landing.step1Desc')}
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex gap-4 sm:gap-6 items-start">
            <div
              class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-accent/30"
            >
              2
            </div>
            <div class="pt-1">
              <h3 class="font-display font-bold text-xl sm:text-2xl mb-2">{$_('landing.step2Title')}</h3>
              <p class="text-surface-500 text-sm sm:text-base">
                {$_('landing.step2Desc')}
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex gap-4 sm:gap-6 items-start">
            <div
              class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-accent/30"
            >
              3
            </div>
            <div class="pt-1">
              <h3 class="font-display font-bold text-xl sm:text-2xl mb-2">{$_('landing.step3Title')}</h3>
              <p class="text-surface-500 text-sm sm:text-base">
                {$_('landing.step3Desc')}
                <strong class="text-surface-900">{$_('landing.step3Strong')}</strong>
                {$_('landing.step3DescEnd')}
              </p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="flex gap-4 sm:gap-6 items-start">
            <div
              class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-accent/30"
            >
              4
            </div>
            <div class="pt-1">
              <h3 class="font-display font-bold text-xl sm:text-2xl mb-2">{$_('landing.step4Title')}</h3>
              <p class="text-surface-500 text-sm sm:text-base">
                {$_('landing.step4Desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technique Section -->
    <section class="py-16 sm:py-24 px-4 sm:px-6 bg-surface-100/50 transition-colors duration-300">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12 sm:mb-16">
          <h2 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-4">
            {$_('landing.techniqueTitle')}
          </h2>
          <p class="text-surface-500">{$_('landing.techniqueSubtitle')}</p>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <!-- Technique 1 -->
          <div class="card-hover p-6 sm:p-8">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 bg-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <span class="text-2xl sm:text-3xl">👐</span>
            </div>
            <h3 class="font-bold text-lg sm:text-xl mb-2 sm:mb-3">
              {$_('landing.technique1Title')}
            </h3>
            <p class="text-surface-500 text-sm sm:text-base">
              {$_('landing.technique1Desc')}
            </p>
          </div>

          <!-- Technique 2 -->
          <div class="card-hover p-6 sm:p-8">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 bg-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <span class="text-2xl sm:text-3xl">🛡️</span>
            </div>
            <h3 class="font-bold text-lg sm:text-xl mb-2 sm:mb-3">
              {$_('landing.technique2Title')}
            </h3>
            <p class="text-surface-500 text-sm sm:text-base">
              {$_('landing.technique2Desc')}
            </p>
          </div>

          <!-- Technique 3 -->
          <div class="card-hover p-6 sm:p-8 sm:col-span-2 md:col-span-1">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 bg-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <span class="text-2xl sm:text-3xl">🍑</span>
            </div>
            <h3 class="font-bold text-lg sm:text-xl mb-2 sm:mb-3">
              {$_('landing.technique3Title')}
            </h3>
            <p class="text-surface-500 text-sm sm:text-base">
              {$_('landing.technique3Desc')}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-16 sm:py-24 px-4 sm:px-6 text-center">
      <div
        class="max-w-3xl mx-auto p-8 sm:p-12 bg-gradient-to-br from-accent to-purple-600 rounded-2xl sm:rounded-[3rem] text-white shadow-2xl shadow-accent/40"
      >
        <h2 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6">{$_('landing.ctaTitle')}</h2>
        <p class="text-base sm:text-xl mb-8 sm:mb-10 opacity-90">
          {$_('landing.ctaSubtitle')}
        </p>
        <a
          href="/signin"
          class="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-white text-accent hover:bg-surface-100 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          {$_('landing.heroCta')}
        </a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="py-8 sm:py-12 px-4 sm:px-6 border-t border-surface-200 transition-colors duration-300">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2">
        <div class="w-6 h-6 bg-accent rounded flex items-center justify-center">
          <span class="text-xs">💪</span>
        </div>
        <span class="font-display font-bold tracking-tight">{$_('app.name')}</span>
      </a>

      <!-- Copyright -->
      <p class="text-sm text-surface-500 text-center">
        &copy; {new Date().getFullYear()}
        {$_('app.name')}. {$_('landing.footerCopyright')}
      </p>

      <!-- Links -->
      <div class="flex gap-6">
        <a href="#" class="text-sm text-surface-500 hover:text-accent transition-colors">
          {$_('landing.footerPrivacy')}
        </a>
        <a href="#" class="text-sm text-surface-500 hover:text-accent transition-colors">
          {$_('landing.footerTerms')}
        </a>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Card hover effect */
  .card-hover {
    @apply bg-surface-50 rounded-2xl sm:rounded-3xl shadow-soft border border-surface-200 
           transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:border-accent/30;
  }

  /* Extra small breakpoint */
  @media (min-width: 480px) {
    .xs\:block {
      display: block;
    }
  }
</style>
