<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { user, isOnline } from '$stores'

  let isLoading = true

  onMount(async () => {
    if (!browser) return

    // If offline and we have a cached user, go to app
    if (!$isOnline && $user) {
      goto('/app')
      return
    }

    try {
      // Wait for Clerk to be available on window (loaded from CDN)
      let attempts = 0
      while (!(window as any).Clerk && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      const Clerk = (window as any).Clerk
      if (!Clerk) {
        isLoading = false
        return
      }

      const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_your_key')
      await clerk.load()

      if (clerk.user) {
        goto('/app')
        return
      }
    } catch (e) {
      console.error('Clerk load failed:', e)
      // If clerk fails (likely offline) but we have a cached user, go to app
      if ($user) {
        goto('/app')
        return
      }
    }

    isLoading = false
  })

  function goToSignIn() {
    goto('/signin')
  }
</script>

<svelte:head>
  <title>{$_('app.name')} - {$_('landing.title')}</title>
</svelte:head>

<div
  class="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 selection:bg-accent/30"
>
  <!-- Navigation -->
  <nav
    class="fixed top-0 w-full z-50 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-gradient-to-br from-accent to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20"
        >
          <span class="text-xl">💪</span>
        </div>
        <span class="font-display font-bold text-xl tracking-tight">{$_('app.name')}</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="/signin" class="text-sm font-medium hover:text-accent transition-colors">
          {$_('auth.signIn')}
        </a>
        <a href="/signin" class="btn btn-primary btn-sm">{$_('landing.startNow')}</a>
      </div>
    </div>
  </nav>

  {#if isLoading}
    <div class="min-h-screen flex items-center justify-center">
      <div class="animate-pulse flex flex-col items-center gap-4">
        <div class="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
        <div class="w-32 h-6 bg-surface-200 dark:bg-surface-800 rounded-lg" />
      </div>
    </div>
  {:else}
    <main>
      <!-- Hero Section -->
      <section class="relative pt-32 pb-20 px-6 overflow-hidden">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div class="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div class="max-w-4xl mx-auto text-center relative z-10">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            {$_('landing.badge')}
          </div>
          <h1 class="font-display font-black text-5xl md:text-7xl mb-6 leading-tight animate-slide-up">
            {$_('landing.heroTitle')}
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600"
              >{$_('landing.heroHighlight')}</span
            >
            {$_('landing.heroTitleEnd')}
          </h1>
          <p
            class="text-xl text-surface-500 dark:text-surface-400 mb-10 max-w-2xl mx-auto animate-slide-up"
            style="animation-delay: 0.1s;"
          >
            {$_('landing.heroSubtitle')}
          </p>
          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style="animation-delay: 0.2s;"
          >
            <a href="/signin" class="btn btn-primary btn-xl w-full sm:w-auto shadow-xl shadow-accent/20">
              {$_('landing.heroCta')}
            </a>
            <a href="#metodo" class="text-sm font-semibold hover:text-accent transition-colors">
              {$_('landing.learnMore')}
            </a>
          </div>
        </div>
      </section>

      <!-- The Method Section -->
      <section id="metodo" class="py-24 px-6 bg-surface-100/50 dark:bg-surface-900/30">
        <div class="max-w-5xl mx-auto">
          <div class="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="font-display font-bold text-3xl md:text-4xl mb-6">{$_('landing.methodTitle')}</h2>
              <div class="space-y-4 text-surface-600 dark:text-surface-400 text-lg">
                <p>
                  {$_('landing.methodP1')} <strong>{$_('landing.methodP1Strong')}</strong>.
                </p>
                <p>
                  {$_('landing.methodP2')}
                  <em class="text-surface-900 dark:text-surface-100">"{$_('landing.methodP2Quote')}"</em>.
                </p>
                <p>
                  {$_('landing.methodP3')}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div
                class="p-6 bg-white dark:bg-surface-800 rounded-3xl shadow-soft border border-surface-200 dark:border-surface-700 transform hover:-translate-y-1 transition-transform"
              >
                <div class="text-3xl mb-4">🧠</div>
                <h3 class="font-bold mb-2">{$_('landing.card1Title')}</h3>
                <p class="text-sm text-surface-500">{$_('landing.card1Desc')}</p>
              </div>
              <div
                class="p-6 bg-white dark:bg-surface-800 rounded-3xl shadow-soft border border-surface-200 dark:border-surface-700 mt-8 transform hover:-translate-y-1 transition-transform"
              >
                <div class="text-3xl mb-4">⚡</div>
                <h3 class="font-bold mb-2">{$_('landing.card2Title')}</h3>
                <p class="text-sm text-surface-500">{$_('landing.card2Desc')}</p>
              </div>
              <div
                class="p-6 bg-white dark:bg-surface-800 rounded-3xl shadow-soft border border-surface-200 dark:border-surface-700 transform hover:-translate-y-1 transition-transform"
              >
                <div class="text-3xl mb-4">📈</div>
                <h3 class="font-bold mb-2">{$_('landing.card3Title')}</h3>
                <p class="text-sm text-surface-500">{$_('landing.card3Desc')}</p>
              </div>
              <div
                class="p-6 bg-white dark:bg-surface-800 rounded-3xl shadow-soft border border-surface-200 dark:border-surface-700 mt-8 transform hover:-translate-y-1 transition-transform"
              >
                <div class="text-3xl mb-4">🎯</div>
                <h3 class="font-bold mb-2">{$_('landing.card4Title')}</h3>
                <p class="text-sm text-surface-500">{$_('landing.card4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- The Protocol Section -->
      <section class="py-24 px-6">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="font-display font-bold text-3xl md:text-4xl mb-4">{$_('landing.protocolTitle')}</h2>
            <p class="text-surface-500">{$_('landing.protocolSubtitle')}</p>
          </div>

          <div class="space-y-12">
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/30"
              >
                1
              </div>
              <div>
                <h3 class="font-display font-bold text-2xl mb-2">{$_('landing.step1Title')}</h3>
                <p class="text-surface-600 dark:text-surface-400">
                  {$_('landing.step1Desc')}
                </p>
              </div>
            </div>

            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/30"
              >
                2
              </div>
              <div>
                <h3 class="font-display font-bold text-2xl mb-2">{$_('landing.step2Title')}</h3>
                <p class="text-surface-600 dark:text-surface-400">
                  {$_('landing.step2Desc')}
                </p>
              </div>
            </div>

            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/30"
              >
                3
              </div>
              <div>
                <h3 class="font-display font-bold text-2xl mb-2">{$_('landing.step3Title')}</h3>
                <p class="text-surface-600 dark:text-surface-400">
                  {$_('landing.step3Desc')} <strong>{$_('landing.step3Strong')}</strong>
                  {$_('landing.step3DescEnd')}
                </p>
              </div>
            </div>

            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/30"
              >
                4
              </div>
              <div>
                <h3 class="font-display font-bold text-2xl mb-2">{$_('landing.step4Title')}</h3>
                <p class="text-surface-600 dark:text-surface-400">
                  {$_('landing.step4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Technique Section -->
      <section class="py-24 px-6 bg-surface-900 text-white overflow-hidden relative">
        <div class="absolute inset-0 opacity-20">
          <div
            class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"
          />
        </div>

        <div class="max-w-5xl mx-auto relative z-10">
          <div class="text-center mb-16">
            <h2 class="font-display font-bold text-3xl md:text-4xl mb-4">{$_('landing.techniqueTitle')}</h2>
            <p class="text-surface-400">{$_('landing.techniqueSubtitle')}</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="p-8 bg-surface-800/50 backdrop-blur-sm rounded-3xl border border-surface-700">
              <div class="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <span class="text-3xl">👐</span>
              </div>
              <h3 class="font-bold text-xl mb-3">{$_('landing.technique1Title')}</h3>
              <p class="text-surface-400">
                {$_('landing.technique1Desc')}
              </p>
            </div>

            <div class="p-8 bg-surface-800/50 backdrop-blur-sm rounded-3xl border border-surface-700">
              <div class="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <span class="text-3xl">🛡️</span>
              </div>
              <h3 class="font-bold text-xl mb-3">{$_('landing.technique2Title')}</h3>
              <p class="text-surface-400">
                {$_('landing.technique2Desc')}
              </p>
            </div>

            <div class="p-8 bg-surface-800/50 backdrop-blur-sm rounded-3xl border border-surface-700">
              <div class="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <span class="text-3xl">🍑</span>
              </div>
              <h3 class="font-bold text-xl mb-3">{$_('landing.technique3Title')}</h3>
              <p class="text-surface-400">
                {$_('landing.technique3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="py-24 px-6 text-center">
        <div
          class="max-w-3xl mx-auto p-12 bg-gradient-to-br from-accent to-purple-600 rounded-[3rem] text-white shadow-2xl shadow-accent/40"
        >
          <h2 class="font-display font-bold text-4xl mb-6">{$_('landing.ctaTitle')}</h2>
          <p class="text-xl mb-10 opacity-90">
            {$_('landing.ctaSubtitle')}
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/signin" class="btn bg-white text-accent hover:bg-surface-50 btn-xl w-full sm:w-auto">
              {$_('landing.ctaGoogle')}
            </a>
            <a href="/signin" class="btn bg-accent-dark text-white hover:bg-accent-dark/80 btn-xl w-full sm:w-auto">
              {$_('landing.ctaEmail')}
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="py-12 px-6 border-t border-surface-200 dark:border-surface-800">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <span class="text-xs">💪</span>
          </div>
          <span class="font-display font-bold tracking-tight">{$_('app.name')}</span>
        </div>
        <p class="text-sm text-surface-500">
          &copy; {new Date().getFullYear()} SovietFit. {$_('landing.footerCopyright')}
        </p>
        <div class="flex gap-6">
          <a href="#" class="text-sm text-surface-500 hover:text-accent transition-colors"
            >{$_('landing.footerPrivacy')}</a
          >
          <a href="#" class="text-sm text-surface-500 hover:text-accent transition-colors"
            >{$_('landing.footerTerms')}</a
          >
        </div>
      </div>
    </footer>
  {/if}
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  .btn-xl {
    @apply px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 active:scale-95;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }

  .animate-slide-up {
    opacity: 0;
    animation: slide-up 0.8s ease-out forwards;
  }
</style>
