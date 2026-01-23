<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { _ } from 'svelte-i18n'
  import { BottomNav } from '$components'
  import { user, exercises, cycles, todaySets, settings, isLoading } from '$stores'
  import { getLocalDateString } from '$lib/utils/date'

  let clerk: any = null

  onMount(async () => {
    if (!browser) return

    try {
      // Load Clerk
      const { Clerk } = await import('@clerk/clerk-js')
      clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_your_key')

      await clerk.load()

      if (!clerk.user) {
        // If no clerk user but we have a cached user, we might be offline
        if ($user) {
          console.log('Using cached user data (offline)')
          isLoading.set(false)
          return
        }
        goto('/')
        return
      }

      // Set user data from Clerk
      user.set({
        id: $user?.id || 0,
        clerkId: clerk.user.id,
        email: clerk.user.primaryEmailAddress?.emailAddress || '',
        name: clerk.user.firstName || clerk.user.username || 'User',
        locale: 'es',
        theme: 'system',
      })

      // Load user data from API
      await loadUserData()
    } catch (e) {
      console.error('App initialization failed:', e)
      // If initialization fails (likely offline) but we have a cached user, continue
      if ($user) {
        console.log('App initialization failed, using cached data')
      } else {
        goto('/')
        return
      }
    }

    isLoading.set(false)
  })

  async function loadUserData() {
    if (!clerk?.user) return

    try {
      const response = await fetch('/api/user/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerk.user.id,
          email: clerk.user.primaryEmailAddress?.emailAddress,
          name: clerk.user.firstName,
          localDate: getLocalDateString(),
          timezoneOffset: -new Date().getTimezoneOffset(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        user.update(u => (u ? { ...u, id: data.user.id } : u))
        exercises.set(data.exercises || [])
        cycles.set(data.cycles || [])
        todaySets.set(data.todaySets || [])
        if (data.settings) {
          settings.set(data.settings)
        }
      }
    } catch (e) {
      console.error('Failed to load user data from API (offline?):', e)
      // We already have cached data in stores from initialization
    }
  }
</script>

<div class="page-container bg-surface-50 dark:bg-black">
  {#if $isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p class="text-surface-500 dark:text-surface-400">
          {$_('common.loading')}
        </p>
      </div>
    </div>
  {:else}
    <slot />
  {/if}

  <BottomNav />
</div>
