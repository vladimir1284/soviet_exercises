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
  <title>{$_('settings.privacyTitle')} - {$_('app.name')}</title>
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
        {$_('settings.privacyTitle')}
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400 mb-12">
        {$_('settings.privacyIntro')}
      </p>

      <div class="space-y-12">
        <!-- Section: Data Collection -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.privacyDataTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.privacyDataDesc')}
          </p>
        </section>

        <!-- Section: Authentication -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.privacyAuthTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.privacyAuthDesc')}
          </p>
        </section>

        <!-- Section: Storage -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.privacyStorageTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.privacyStorageDesc')}
          </p>
        </section>

        <!-- Section: Sensitive Info -->
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
            <h2 class="text-2xl font-bold">{$_('settings.privacySensitiveTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.privacySensitiveDesc')}
          </p>
        </section>

        <!-- Section: Sharing -->
        <section class="space-y-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold">{$_('settings.privacySharingTitle')}</h2>
          </div>
          <p class="text-surface-600 dark:text-surface-400 leading-relaxed">
            {$_('settings.privacySharingDesc')}
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
