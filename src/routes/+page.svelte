<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { user, isOnline } from '$stores'

  let clerk: any = null
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
      if (!Clerk) throw new Error('Clerk not found on window')

      clerk = Clerk

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

  async function signInWithGoogle() {
    if (!clerk) return
    await clerk.openSignIn({
      redirectUrl: '/app',
      appearance: {
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-none',
        },
      },
    })
  }

  async function signInWithEmail() {
    if (!clerk) return
    await clerk.openSignIn({
      redirectUrl: '/app',
    })
  }
</script>

<svelte:head>
  <title>{$_('app.name')} - {$_('app.tagline')}</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col bg-gradient-to-br from-surface-100 via-surface-50 to-indigo-50 dark:from-surface-950 dark:via-surface-950 dark:to-indigo-950/30"
>
  <!-- Decorative elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
  </div>

  <main class="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
    {#if isLoading}
      <div class="animate-pulse flex flex-col items-center gap-4">
        <div class="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
        <div class="w-32 h-6 bg-surface-200 dark:bg-surface-800 rounded-lg" />
      </div>
    {:else}
      <!-- Logo & Title -->
      <div class="text-center mb-12 animate-fade-in">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-accent/30 rotate-3 hover:rotate-0 transition-transform duration-300"
        >
          <img src="/icons/icon.svg" alt="" class="w-24 h-24 inline-block" />
        </div>
        <h1 class="font-display font-bold text-4xl text-surface-900 dark:text-surface-100 mb-2">
          {$_('app.name')}
        </h1>
        <p class="text-surface-600 dark:text-surface-300 text-lg">
          {$_('app.tagline')}
        </p>
      </div>

      <!-- Auth buttons -->
      <div class="w-full max-w-sm space-y-4 animate-slide-up" style="animation-delay: 0.1s;">
        <button
          class="w-full btn btn-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 shadow-soft"
          on:click={signInWithGoogle}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {$_('auth.continueWith', { values: { provider: 'Google' } })}
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-surface-200 dark:border-surface-700" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span
              class="px-4 bg-gradient-to-br from-surface-100 via-surface-50 to-indigo-50 dark:from-surface-950 dark:via-surface-950 dark:to-indigo-950/30 text-surface-600 dark:text-surface-400"
            >
              {$_('auth.orEmail')}
            </span>
          </div>
        </div>

        <button class="w-full btn btn-primary btn-lg" on:click={signInWithEmail}>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          {$_('auth.signIn')}
        </button>
      </div>

      <!-- Features preview -->
      <div class="mt-16 grid grid-cols-3 gap-6 text-center animate-slide-up" style="animation-delay: 0.2s;">
        <div class="space-y-2">
          <div class="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p class="text-xs text-surface-700 dark:text-surface-200 font-medium">
            {$_('stats.progress')}
          </p>
        </div>
        <div class="space-y-2">
          <div class="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <svg
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p class="text-xs text-surface-700 dark:text-surface-200 font-medium">
            {$_('exercises.configure')}
          </p>
        </div>
        <div class="space-y-2">
          <div
            class="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-purple-600 dark:text-purple-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
          </div>
          <p class="text-xs text-surface-700 dark:text-surface-200 font-medium">
            {$_('stats.title')}
          </p>
        </div>
      </div>
    {/if}
  </main>

  <!-- Footer -->
  <footer
    class="py-12 px-6 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-black/50 relative"
  >
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 bg-gradient-to-br from-accent to-purple-600 rounded flex items-center justify-center shadow-sm"
        >
          <img src="/icons/icon.svg" alt="" class="w-5 h-5" />
        </div>
        <span class="font-display font-bold text-surface-900 dark:text-surface-100">{$_('app.name')}</span>
      </div>

      <div class="flex items-center gap-8 text-sm font-medium text-surface-600 dark:text-surface-400">
        <a href="/privacy" class="hover:text-accent transition-colors">{$_('landing.footerPrivacy')}</a>
        <a href="/terms" class="hover:text-accent transition-colors">{$_('landing.footerTerms')}</a>
        <a href="/data-deletion" class="hover:text-accent transition-colors">{$_('landing.footerDataDeletion')}</a>
      </div>

      <p class="text-xs text-surface-500 dark:text-surface-600">
        {$_('app.name')} &copy; {new Date().getFullYear()}
      </p>
    </div>
  </footer>
</div>

<style>
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
