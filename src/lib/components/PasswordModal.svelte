<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { clerkInstance, toasts } from '$stores'
  import Modal from './Modal.svelte'

  export let open = false
  export let onClose: () => void = () => {}

  let newPassword = ''
  let confirmPassword = ''
  let isLoading = false
  let errorMsg = ''

  function reset() {
    newPassword = ''
    confirmPassword = ''
    isLoading = false
    errorMsg = ''
  }

  function close() {
    reset()
    onClose()
  }

  async function save() {
    errorMsg = ''

    if (newPassword.length < 8) {
      errorMsg = $_('settings.setPasswordTooShort')
      return
    }
    if (newPassword !== confirmPassword) {
      errorMsg = $_('settings.setPasswordMismatch')
      return
    }

    isLoading = true
    try {
      const clerk = $clerkInstance
      if (!clerk?.user) throw new Error('Not authenticated')

      await clerk.user.updatePassword({
        newPassword,
        signOutOfOtherSessions: false,
      })

      toasts.add({ message: $_('settings.setPasswordSuccess'), type: 'success' })
      close()
    } catch (e: any) {
      const msg = e?.errors?.[0]?.longMessage || e?.message || $_('common.error')
      errorMsg = msg
    } finally {
      isLoading = false
    }
  }
</script>

<Modal {open} title={$_('settings.setPassword')} on:close={close}>
  <div class="space-y-4">
    <!-- Description -->
    <p class="text-sm text-surface-500 dark:text-surface-400 mt-0.5 mb-4">
      {$_('settings.setPasswordDesc')}
    </p>

    <!-- Fields -->
    <div>
      <label for="pw-new" class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('settings.setPasswordNew')}
      </label>
      <input
        id="pw-new"
        type="password"
        class="input"
        placeholder="••••••••"
        bind:value={newPassword}
        autocomplete="new-password"
      />
    </div>

    <div>
      <label for="pw-confirm" class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('settings.setPasswordConfirm')}
      </label>
      <input
        id="pw-confirm"
        type="password"
        class="input"
        placeholder="••••••••"
        bind:value={confirmPassword}
        autocomplete="new-password"
        on:keydown={e => e.key === 'Enter' && save()}
      />
    </div>

    {#if errorMsg}
      <p class="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
        {errorMsg}
      </p>
    {/if}
  </div>

  <svelte:fragment slot="footer">
    <div class="flex gap-3">
      <button
        class="btn btn-secondary btn-md flex-1"
        on:click={close}
        disabled={isLoading}
      >
        {$_('common.cancel')}
      </button>
      <button
        class="btn btn-primary btn-md flex-1"
        on:click={save}
        disabled={isLoading}
      >
        {#if isLoading}
          <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        {/if}
        {$_('settings.setPasswordSave')}
      </button>
    </div>
  </svelte:fragment>
</Modal>
