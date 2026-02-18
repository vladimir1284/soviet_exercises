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
  <title>{$_('settings.dataDeletionTitle')} - {$_('app.name')}</title>
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
      <a href="/" class="btn btn-ghost btn-sm">
        {$_('common.back')}
      </a>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-6 py-12">
    <div class="animate-fade-in">
      <h1 class="font-display font-bold text-4xl mb-4 text-surface-900 dark:text-surface-100">
        {$_('settings.dataDeletionTitle')}
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400 mb-12">
        {$_('settings.dataDeletionIntro')}
      </p>

      <div class="space-y-12">
        <!-- Section: Steps -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.dataDeletionStepsTitle')}</h2>
          </div>
          <div class="space-y-3 pl-13">
            <div class="flex gap-4">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-xs font-bold"
                >1</span
              >
              <p class="text-surface-600 dark:text-surface-400">{$_('settings.dataDeletionStep1')}</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-xs font-bold"
                >2</span
              >
              <p class="text-surface-600 dark:text-surface-400">{$_('settings.dataDeletionStep2')}</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-xs font-bold"
                >3</span
              >
              <p class="text-surface-600 dark:text-surface-400">{$_('settings.dataDeletionStep3')}</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center text-xs font-bold"
                >4</span
              >
              <p class="text-surface-600 dark:text-surface-400">{$_('settings.dataDeletionStep4')}</p>
            </div>
          </div>
        </section>

        <!-- Section: Alternative -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.dataDeletionAlternativeTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.dataDeletionAlternativeDesc')}
          </p>
        </section>

        <!-- Section: Data Types -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
                <line x1="16" y1="5" x2="16" y2="19" />
                <line x1="2" y1="10" x2="21" y2="10" />
                <path d="M19 15l2 2-2 2" />
                <path d="M21 17h-7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.dataDeletionTypesTitle')}</h2>
          </div>
          <div class="space-y-4">
            <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
              {$_('settings.dataDeletionTypesDeleted')}
            </p>
            <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
              {$_('settings.dataDeletionTypesKept')}
            </p>
          </div>
        </section>

        <!-- Section: Retention -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.dataDeletionRetentionTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.dataDeletionRetentionDesc')}
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
