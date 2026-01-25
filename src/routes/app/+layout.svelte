<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { _ } from 'svelte-i18n'
  import { BottomNav } from '$components'
  import { user, exercises, cycles, todaySets, settings, isLoading, clerkInstance } from '$stores'
  import { getLocalDateString } from '$lib/utils/date'

  let clerk: any = null

  onMount(async () => {
    if (!browser) return

    // Immediate offline check
    if (!navigator.onLine && $user) {
      console.log('Offline detected, using cached user data')
      isLoading.set(false)
      return
    }

    try {
      // Load Clerk with a timeout
      const clerkPromise = (async () => {
        // Wait for Clerk to be available on window (loaded from CDN)
        let attempts = 0
        while (!(window as any).Clerk && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        const Clerk = (window as any).Clerk
        if (!Clerk) throw new Error('Clerk not found on window')

        const instance = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_your_key')
        await instance.load()
        return instance
      })()

      // Timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Clerk load timeout')), 5000))

      clerk = (await Promise.race([clerkPromise, timeoutPromise])) as any
      clerkInstance.set(clerk)

      if (!clerk.user) {
        // If no clerk user but we have a cached user, we might be offline or session expired
        if ($user) {
          console.log('No Clerk user, using cached user data')
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
      console.error('App initialization failed or timed out:', e)
      // If initialization fails (likely offline or timeout) but we have a cached user, continue
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
