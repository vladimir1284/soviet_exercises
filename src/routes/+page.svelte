<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { user, isOnline } from '$stores'

  import AuthIdle from '$lib/components/auth/AuthIdle.svelte'
  import AuthEmailCode from '$lib/components/auth/AuthEmailCode.svelte'
  import AuthOtp from '$lib/components/auth/AuthOtp.svelte'
  import AuthEmailPassword from '$lib/components/auth/AuthEmailPassword.svelte'
  import AuthPassword from '$lib/components/auth/AuthPassword.svelte'
  import FeaturePills from '$lib/components/auth/FeaturePills.svelte'
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'

  // ─── Types ────────────────────────────────────────────────────────────────
  type Step =
    | 'idle'
    | 'email-code' // email input → OTP flow
    | 'otp' // enter the received code
    | 'email-password' // email input → password flow
    | 'password' // enter password

  type AuthMode = 'code' | 'password' | null

  // ─── State ────────────────────────────────────────────────────────────────
  let clerk: any = null
  let signInAttempt: any = null

  let isLoading = true
  let step: Step = 'idle'
  let authMode: AuthMode = null
  let error = ''

  let email = ''
  let password = ''
  let otpCode = ''
  let showPassword = false
  let isSubmitting = false

  // ─── WebView detection ────────────────────────────────────────────────────
  function detectWebView(): boolean {
    if (!browser) return false
    const ua = navigator.userAgent
    const isIOSWebView = /iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua)
    const isAndroidWV = /Android/.test(ua) && /wv/.test(ua)
    const isSocialBrowser = /FBAN|FBAV|Instagram|Twitter|LinkedInApp|Snapchat|Line\/|MicroMessenger/.test(ua)
    return isIOSWebView || isAndroidWV || isSocialBrowser
  }

  let isWebView = false

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  onMount(async () => {
    if (!browser) return

    isWebView = detectWebView()

    if (!$isOnline && $user) {
      goto('/app')
      return
    }

    try {
      let attempts = 0
      while (!(window as any).Clerk && attempts < 50) {
        await new Promise(r => setTimeout(r, 100))
        attempts++
      }

      const Clerk = (window as any).Clerk
      if (!Clerk) throw new Error('Clerk not available')

      clerk = Clerk
      await clerk.load()

      if (clerk.user) {
        goto('/app')
        return
      }
    } catch (e) {
      console.error('Clerk load failed:', e)
      if ($user) {
        goto('/app')
        return
      }
    }

    isLoading = false
  })

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function clerkErrorMessage(err: any): string {
    const code = err?.errors?.[0]?.code ?? ''
    const msg = err?.errors?.[0]?.message ?? ''

    const map: Record<string, string> = {
      form_identifier_not_found: $_('auth.errors.userNotFound'),
      form_password_incorrect: $_('auth.errors.wrongPassword'),
      too_many_requests: $_('auth.errors.tooManyRequests'),
      form_identifier_exists: $_('auth.errors.emailExists'),
      session_exists: $_('auth.errors.sessionExists'),
      form_code_incorrect: $_('auth.errors.invalidCode'),
      form_code_expired: $_('auth.errors.expiredCode'),
    }

    return map[code] ?? msg ?? $_('auth.errors.generic')
  }

  function reset() {
    step = 'idle'
    authMode = null
    error = ''
    email = ''
    password = ''
    otpCode = ''
    isSubmitting = false
    signInAttempt = null
  }

  function goBack() {
    error = ''
    isSubmitting = false

    if (step === 'password') {
      step = 'email-password'
      password = ''
      signInAttempt = null
    } else if (step === 'otp') {
      step = 'email-code'
      otpCode = ''
      signInAttempt = null
    } else {
      reset()
    }
  }

  // ─── OTP flow: Step 1 → send code ─────────────────────────────────────────
  async function submitEmailForCode() {
    if (!email.trim() || isSubmitting) return
    error = ''
    isSubmitting = true

    try {
      signInAttempt = await clerk.client.signIn.create({ identifier: email.trim() })

      const emailCodeFactor = signInAttempt.supportedFirstFactors?.find((f: any) => f.strategy === 'email_code')

      if (!emailCodeFactor) {
        error = $_('auth.errors.noEmailCodeFactor')
        isSubmitting = false
        return
      }

      await signInAttempt.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailCodeFactor.emailAddressId,
      })
      step = 'otp'
    } catch (e: any) {
      error = clerkErrorMessage(e)
    } finally {
      isSubmitting = false
    }
  }

  // ─── OTP flow: Step 2 → verify code ───────────────────────────────────────
  async function submitOtp() {
    if (!otpCode.trim() || isSubmitting || !signInAttempt) return
    error = ''
    isSubmitting = true

    try {
      const result = await signInAttempt.attemptFirstFactor({
        strategy: 'email_code',
        code: otpCode.trim(),
      })

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId })
        goto('/app')
      } else if (result.status === 'needs_second_factor') {
        error = $_('auth.errors.needs2FA')
      } else {
        error = $_('auth.errors.generic')
      }
    } catch (e: any) {
      error = clerkErrorMessage(e)
    } finally {
      isSubmitting = false
    }
  }

  async function resendCode() {
    if (!signInAttempt || isSubmitting) return
    error = ''
    isSubmitting = true
    try {
      const emailCodeFactor = signInAttempt.supportedFirstFactors?.find((f: any) => f.strategy === 'email_code')
      await signInAttempt.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailCodeFactor?.emailAddressId,
      })
      otpCode = ''
    } catch (e: any) {
      error = clerkErrorMessage(e)
    } finally {
      isSubmitting = false
    }
  }

  // ─── Password flow: Step 1 → resolve email ────────────────────────────────
  async function submitEmailForPassword() {
    if (!email.trim() || isSubmitting) return
    error = ''
    isSubmitting = true

    try {
      signInAttempt = await clerk.client.signIn.create({ identifier: email.trim() })

      const supportsPassword = signInAttempt.supportedFirstFactors?.some((f: any) => f.strategy === 'password')

      if (supportsPassword) {
        step = 'password'
      } else {
        error = $_('auth.errors.noPasswordFactor')
      }
    } catch (e: any) {
      error = clerkErrorMessage(e)
    } finally {
      isSubmitting = false
    }
  }

  // ─── Password flow: Step 2 → attempt password ─────────────────────────────
  async function submitPassword() {
    if (!password || isSubmitting || !signInAttempt) return
    error = ''
    isSubmitting = true

    try {
      const result = await signInAttempt.attemptFirstFactor({
        strategy: 'password',
        password,
      })

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId })
        goto('/app')
      } else if (result.status === 'needs_second_factor') {
        error = $_('auth.errors.needs2FA')
      } else {
        error = $_('auth.errors.generic')
      }
    } catch (e: any) {
      error = clerkErrorMessage(e)
    } finally {
      isSubmitting = false
    }
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    if (!clerk || isWebView) return
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/app',
      })
    } catch (e: any) {
      error = clerkErrorMessage(e)
    }
  }

</script>

<!-- ─────────────────────────────────────────────── -->
<svelte:head>
  <title>{$_('app.name')} - {$_('app.tagline')}</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col bg-gradient-to-br from-surface-100 via-surface-50 to-indigo-50
         dark:from-surface-50 dark:via-surface-50 dark:to-indigo-950/30"
>
  <!-- Decorative blobs -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
  </div>

  <main class="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
    <!-- ── Skeleton while Clerk loads ── -->
    {#if isLoading}
      <div class="animate-pulse flex flex-col items-center gap-4">
        <div class="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
        <div class="w-32 h-6 bg-surface-200 dark:bg-surface-800 rounded-lg" />
      </div>
    {:else}
      <!-- ── Logo & title ── -->
      <div class="text-center mb-10 animate-fade-in">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent to-purple-600 rounded-3xl
                 flex items-center justify-center shadow-lg shadow-accent/30
                 rotate-3 hover:rotate-0 transition-transform duration-300"
        >
          <img src="/icons/icon.svg" alt="" class="w-24 h-24" />
        </div>
        <h1 class="font-display font-bold text-4xl text-surface-900 dark:text-white mb-2">
          {$_('app.name')}
        </h1>
        <p class="text-surface-600 dark:text-surface-400 text-lg">
          {$_('app.tagline')}
        </p>
      </div>

      <!-- ── Auth card ── -->
      <div class="w-full max-w-sm animate-slide-up" style="animation-delay: 0.1s;">
        <!-- Back button (any non-idle step) -->
        {#if step !== 'idle'}
          <button
            class="flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400
                   hover:text-accent dark:hover:text-accent transition-colors mb-6"
            on:click={goBack}
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {$_('common.back')}
          </button>
        {/if}

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- AUTH COMPONENTS                                                -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        {#if step === 'idle'}
          <div class="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <AuthIdle
            {isWebView}
            on:emailCode={() => {
              authMode = 'code'
              step = 'email-code'
              error = ''
            }}
            on:emailPassword={() => {
              authMode = 'password'
              step = 'email-password'
              error = ''
            }}
            on:google={signInWithGoogle}
          />
        {:else if step === 'email-code'}
          <AuthEmailCode
            bind:email
            {error}
            {isSubmitting}
            on:submit={submitEmailForCode}
          />
        {:else if step === 'otp'}
          <AuthOtp
            {email}
            bind:otpCode
            {error}
            {isSubmitting}
            on:back={goBack}
            on:submit={submitOtp}
            on:resend={resendCode}
          />
        {:else if step === 'email-password'}
          <AuthEmailPassword
            bind:email
            {error}
            {isSubmitting}
            on:submit={submitEmailForPassword}
          />
        {:else if step === 'password'}
          <AuthPassword
            {email}
            bind:password
            {error}
            {isSubmitting}
            on:back={goBack}
            on:submit={submitPassword}
          />
        {/if}
      </div>

      <!-- ── Feature pills (solo en idle) ── -->
      {#if step === 'idle'}
        <FeaturePills />
      {/if}
    {/if}
  </main>

  <!-- ── Footer ── -->
  <footer
    class="py-10 px-6 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-black/90 relative"
  >
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 bg-gradient-to-br from-accent to-purple-600 rounded flex items-center justify-center shadow-sm"
        >
          <img src="/icons/icon.svg" alt="" class="w-6 h-6" />
        </div>
        <span class="font-display font-bold text-surface-900 dark:text-white">{$_('app.name')}</span>
      </div>

      <div class="flex items-center gap-8 text-sm font-medium text-surface-600 dark:text-surface-400">
        <a href="/privacy" class="hover:text-accent transition-colors">{$_('landing.footerPrivacy')}</a>
        <a href="/terms" class="hover:text-accent transition-colors">{$_('landing.footerTerms')}</a>
        <a href="/data-deletion" class="hover:text-accent transition-colors">{$_('landing.footerDataDeletion')}</a>
      </div>

      <p class="text-xs text-surface-500">{$_('app.name')} &copy; {new Date().getFullYear()}</p>
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
