<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { createEventDispatcher } from 'svelte'

  export let email: string = ''
  export let password: string = ''
  export let error: string = ''
  export let isSubmitting: boolean = false

  let showPassword = false

  const dispatch = createEventDispatcher<{
    submit: void
    back: void
  }>()

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') dispatch('submit')
  }
</script>

<div class="space-y-4">
  <!-- Email recap -->
  <button
    class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl
           bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700
           text-sm text-surface-600 dark:text-surface-300 hover:border-accent/50 transition-colors text-left"
    on:click={() => dispatch('back')}
    title={$_('auth.changeEmail')}
  >
    <svg
      class="w-4 h-4 text-surface-400 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
    <span class="truncate flex-1">{email}</span>
    <svg
      class="w-3.5 h-3.5 text-surface-400 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  </button>

  <div>
    <div class="flex justify-between items-center mb-1.5">
      <label for="password" class="text-sm font-medium text-surface-700 dark:text-surface-300">
        {$_('auth.password')}
      </label>
      <a href="/forgot-password" class="text-xs text-accent hover:underline" tabindex="-1">
        {$_('auth.forgotPassword')}
      </a>
    </div>

    <div class="relative">
      {#if showPassword}
        <input
          id="password"
          type="text"
          bind:value={password}
          on:keydown={onKeydown}
          placeholder="••••••••"
          autocomplete="current-password"
          class="w-full input input-bordered pr-11"
          class:input-error={!!error}
          disabled={isSubmitting}
        />
      {:else}
        <input
          id="password"
          type="password"
          bind:value={password}
          on:keydown={onKeydown}
          placeholder="••••••••"
          autocomplete="current-password"
          autofocus
          class="w-full input input-bordered pr-11"
          class:input-error={!!error}
          disabled={isSubmitting}
        />
      {/if}
      <button
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600
               dark:hover:text-surface-300 transition-colors"
        on:click={() => (showPassword = !showPassword)}
        tabindex="-1"
        aria-label={showPassword ? $_('auth.hidePassword') : $_('auth.showPassword')}
      >
        {#if showPassword}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  {#if error}
    <p class="text-sm text-error flex items-center gap-1.5" role="alert">
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
          x1="12"
          y1="16"
          x2="12.01"
          y2="16"
        />
      </svg>
      {error}
    </p>
  {/if}

  <button
    class="w-full btn btn-primary btn-lg"
    on:click={() => dispatch('submit')}
    disabled={!password || isSubmitting}
  >
    {#if isSubmitting}
      <span class="loading loading-spinner loading-sm" />
    {:else}
      {$_('auth.signIn')}
    {/if}
  </button>
</div>
