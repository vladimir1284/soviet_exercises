<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  onMount(() => {
    if (browser) {
      window.scrollTo(0, 0)
    }
  })
</script>

<svelte:head>
  <title>{$_('settings.termsTitle')} - {$_('app.name')}</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-black text-surface-900 dark:text-surface-100">
  <!-- Header -->
  <header
    class="sticky top-0 z-10 bg-surface-50/80 dark:bg-black/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800"
  >
    <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 group">
        <div
          class="w-8 h-8 bg-gradient-to-br from-accent to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
        >
          <img src="/icons/icon.svg" alt="" class="w-8 h-8" />
        </div>
        <span class="font-display font-bold text-xl">{$_('app.name')}</span>
      </a>
      <div class="flex items-center gap-4">
        <a
          href="https://github.com/vladimir1284/soviet_exercises"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-ghost btn-sm flex items-center gap-2"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub
        </a>
        <a href="/" class="btn btn-ghost btn-sm">
          {$_('common.back')}
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-6 py-12">
    <div class="animate-fade-in">
      <h1 class="font-display font-bold text-4xl mb-4 text-surface-900 dark:text-surface-100">
        {$_('settings.termsTitle')}
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400 mb-12">
        {$_('settings.termsIntro')}
      </p>

      <div class="space-y-12">
        <!-- Section: Open Source -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.termsOpenSourceTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.termsOpenSourceDesc')}
          </p>
        </section>

        <!-- Section: As-Is -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.termsAsIsTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.termsAsIsDesc')}
          </p>
        </section>

        <!-- Section: Contributions -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.termsContributionTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.termsContributionDesc')}
          </p>
        </section>

        <!-- Section: Personal Use -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.termsPersonalUseTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.termsPersonalUseDesc')}
          </p>
        </section>
      </div>

      <div class="mt-20 pt-8 border-t border-surface-200 dark:border-surface-800 text-center">
        <p class="text-sm text-surface-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  </main>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
</style>
