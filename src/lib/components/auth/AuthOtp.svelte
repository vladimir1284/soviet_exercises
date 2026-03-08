<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { createEventDispatcher } from 'svelte'

  export let email: string = ''
  export let otpCode: string = ''
  export let error: string = ''
  export let isSubmitting: boolean = false

  const dispatch = createEventDispatcher<{
    submit: void
    back: void
    resend: void
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
    <label for="otp" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
      {$_('auth.verificationCode')}
    </label>
    <p class="text-xs text-surface-500 dark:text-surface-400 mb-2">
      {$_('auth.codesentTo', { values: { email } })}
    </p>
    <input
      id="otp"
      type="text"
      inputmode="numeric"
      bind:value={otpCode}
      on:keydown={onKeydown}
      placeholder="000000"
      autocomplete="one-time-code"
      autofocus
      maxlength="6"
      class="w-full input input-bordered tracking-[0.5em] text-center text-lg font-mono"
      class:input-error={!!error}
      disabled={isSubmitting}
    />
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
    disabled={otpCode.trim().length < 4 || isSubmitting}
  >
    {#if isSubmitting}
      <span class="loading loading-spinner loading-sm" />
    {:else}
      {$_('auth.verifyCode')}
    {/if}
  </button>

  <!-- Resend -->
  <p class="text-center text-sm text-surface-500 dark:text-surface-400">
    {$_('auth.didntReceive')}
    <button
      class="text-accent hover:underline disabled:opacity-50"
      on:click={() => dispatch('resend')}
      disabled={isSubmitting}
    >
      {$_('auth.resendCode')}
    </button>
  </p>
</div>
