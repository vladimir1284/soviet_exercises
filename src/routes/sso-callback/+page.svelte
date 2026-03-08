<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { _ } from 'svelte-i18n'

  let error = ''

  onMount(async () => {
    try {
      let attempts = 0
      while (!(window as any).Clerk && attempts < 50) {
        await new Promise(r => setTimeout(r, 100))
        attempts++
      }

      const Clerk = (window as any).Clerk
      if (!Clerk) throw new Error('Clerk not available')

      await Clerk.load()

      // Handle the redirect callback from Clerk
      await Clerk.handleRedirectCallback({
        redirectUrl: '/app'
      })

    } catch (e) {
      console.error('SSO callback failed:', e)
      error = $_('common.error')
      setTimeout(() => goto('/'), 3000)
    }
  })
</script>

<div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
  <div class="text-center">
    {#if error}
      <div class="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-red-600 dark:text-red-400 font-medium">{error}</p>
    {:else}
      <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-surface-600 dark:text-surface-400 font-medium">{$_('common.loading')}</p>
    {/if}
  </div>
</div>
