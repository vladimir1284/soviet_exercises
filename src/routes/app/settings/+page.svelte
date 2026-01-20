<script lang="ts">
  import { _ } from "svelte-i18n";
  import { locale, locales, localeNames } from "$lib/i18n";
  import { user, theme, settings, toasts } from "$stores";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  type ThemeOption = "system" | "light" | "dark";

  const themes: { value: ThemeOption; labelKey: string; icon: string }[] = [
    { value: "system", labelKey: "settings.themeSystem", icon: "💻" },
    { value: "light", labelKey: "settings.themeLight", icon: "☀️" },
    { value: "dark", labelKey: "settings.themeDark", icon: "🌙" },
  ];

  // Local settings copy
  let localSettings = { ...$settings };

  // Save settings
  async function saveSettings() {
    if (!$user?.id) return;

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...localSettings, userId: $user.id }),
      });

      if (response.ok) {
        settings.set(localSettings);
        toasts.add({ message: $_("common.save"), type: "success" });
      }
    } catch (e) {
      toasts.add({ message: $_("common.error"), type: "error" });
    }
  }

  // Sign out
  async function signOut() {
    if (!browser) return;

    const { Clerk } = await import("@clerk/clerk-js");
    const clerk = new Clerk(
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_your_key",
    );
    await clerk.load();
    await clerk.signOut();

    user.signOut();
    goto("/");
  }

  // Change language
  function changeLocale(newLocale: string) {
    locale.set(newLocale);
    if (browser) {
      localStorage.setItem("locale", newLocale);
    }
  }

  // Change theme
  function changeTheme(newTheme: ThemeOption) {
    theme.set(newTheme);
  }
</script>

<svelte:head>
  <title>{$_("nav.settings")} - {$_("app.name")}</title>
</svelte:head>

<div class="px-4 py-6 space-y-6">
  <!-- Header -->
  <header>
    <h1
      class="font-display font-bold text-2xl text-surface-900 dark:text-surface-900"
    >
      {$_("settings.title")}
    </h1>
  </header>

  <!-- Account section -->
  <section>
    <h2 class="section-header">{$_("settings.account")}</h2>
    <div class="card divide-y divide-surface-200/50 dark:divide-surface-200/20">
      <div class="p-4 flex items-center gap-4">
        <div
          class="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center"
        >
          <span class="text-xl font-semibold text-accent">
            {($user?.name || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <div class="flex-1">
          <p class="font-medium text-surface-900 dark:text-surface-900">
            {$user?.name || "User"}
          </p>
          <p class="text-sm text-surface-500 dark:text-surface-400">
            {$user?.email || ""}
          </p>
        </div>
      </div>

      <button
        class="w-full p-4 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        on:click={signOut}
      >
        {$_("auth.signOut")}
      </button>
    </div>
  </section>

  <!-- Appearance section -->
  <section>
    <h2 class="section-header">{$_("settings.appearance")}</h2>
    <div class="card divide-y divide-surface-200/50 dark:divide-surface-200/20">
      <!-- Theme -->
      <div class="p-4">
        <p
          class="text-sm font-medium text-surface-700 dark:text-surface-700 mb-3"
        >
          {$_("settings.theme")}
        </p>
        <div class="grid grid-cols-3 gap-2">
          {#each themes as t}
            <button
              class="p-3 rounded-xl text-center transition-all
                {$theme === t.value
                ? 'bg-accent/10 ring-2 ring-accent'
                : 'bg-surface-100 dark:bg-surface-100/50 hover:bg-surface-200 dark:hover:bg-surface-200'}"
              on:click={() => changeTheme(t.value)}
            >
              <span class="text-xl">{t.icon}</span>
              <p class="text-xs mt-1 text-surface-600 dark:text-surface-600">
                {$_(t.labelKey)}
              </p>
            </button>
          {/each}
        </div>
      </div>

      <!-- Language -->
      <div class="p-4">
        <p
          class="text-sm font-medium text-surface-700 dark:text-surface-700 mb-3"
        >
          {$_("settings.language")}
        </p>
        <div class="grid grid-cols-2 gap-2">
          {#each locales as loc}
            <button
              class="p-3 rounded-xl text-center transition-all
                {$locale === loc
                ? 'bg-accent/10 ring-2 ring-accent'
                : 'bg-surface-100 dark:bg-surface-100/50 hover:bg-surface-200 dark:hover:bg-surface-200'}"
              on:click={() => changeLocale(loc)}
            >
              <span class="text-xl">{loc === "es" ? "🇪🇸" : "🇺🇸"}</span>
              <p class="text-xs mt-1 text-surface-600 dark:text-surface-600">
                {localeNames[loc]}
              </p>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Default values section -->
  <section>
    <h2 class="section-header">{$_("settings.defaults")}</h2>
    <div class="card p-4 space-y-4">
      <div>
        <label for="sets-per-day" class="flex items-center justify-between">
          <span class="text-sm text-surface-700 dark:text-surface-700">
            {$_("exercises.setsPerDay")}
          </span>
          <span class="num-display text-lg text-accent">
            {localSettings.defaultSetsPerDay}
          </span>
        </label>
        <input
          id="sets-per-day"
          type="range"
          min="1"
          max="20"
          class="w-full mt-2 accent-accent"
          bind:value={localSettings.defaultSetsPerDay}
          on:change={saveSettings}
        />
      </div>

      <div>
        <label for="days-per-week" class="flex items-center justify-between">
          <span class="text-sm text-surface-700 dark:text-surface-700">
            {$_("exercises.daysPerWeek")}
          </span>
          <span class="num-display text-lg text-accent">
            {localSettings.defaultDaysPerWeek}
          </span>
        </label>
        <input
          id="days-per-week"
          type="range"
          min="1"
          max="7"
          class="w-full mt-2 accent-accent"
          bind:value={localSettings.defaultDaysPerWeek}
          on:change={saveSettings}
        />
      </div>

      <div>
        <label for="cycle-weeks" class="flex items-center justify-between">
          <span class="text-sm text-surface-700 dark:text-surface-700">
            {$_("exercises.cycleWeeks")}
          </span>
          <span class="num-display text-lg text-accent">
            {localSettings.defaultCycleWeeks}
          </span>
        </label>
        <input
          id="cycle-weeks"
          type="range"
          min="1"
          max="8"
          class="w-full mt-2 accent-accent"
          bind:value={localSettings.defaultCycleWeeks}
          on:change={saveSettings}
        />
      </div>
    </div>
  </section>

  <!-- Notifications section -->
  <section>
    <h2 class="section-header">{$_("settings.notifications")}</h2>
    <div class="card p-4">
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-surface-700 dark:text-surface-700">
          {$_("settings.notifyRecalibrate")}
        </span>
        <div class="relative">
          <input
            type="checkbox"
            class="sr-only peer"
            bind:checked={localSettings.notificationEnabled}
            on:change={saveSettings}
          />
          <div
            class="w-11 h-6 bg-surface-300 dark:bg-surface-300 rounded-full peer peer-checked:bg-accent transition-colors"
          />
          <div
            class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow"
          />
        </div>
      </label>
    </div>
  </section>

  <!-- About section -->
  <section>
    <h2 class="section-header">{$_("settings.about")}</h2>
    <div class="card divide-y divide-surface-200/50 dark:divide-surface-200/20">
      <div class="p-4 flex items-center justify-between">
        <span class="text-sm text-surface-700 dark:text-surface-700">
          {$_("settings.version")}
        </span>
        <span class="text-sm text-surface-500 dark:text-surface-400">
          1.0.0
        </span>
      </div>

      <a
        href="mailto:feedback@flexfit.app"
        class="block p-4 text-sm text-surface-700 dark:text-surface-700 hover:bg-surface-100/50 transition-colors"
      >
        {$_("settings.feedback")}
      </a>

      <a
        href="/privacy"
        class="block p-4 text-sm text-surface-700 dark:text-surface-700 hover:bg-surface-100/50 transition-colors"
      >
        {$_("settings.privacy")}
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer class="text-center py-8">
    <p class="text-xs text-surface-400 dark:text-surface-500">
      FlexFit &copy; {new Date().getFullYear()}
    </p>
    <p class="text-xs text-surface-400 dark:text-surface-500 mt-1">
      Made with 💪 for fitness enthusiasts
    </p>
  </footer>
</div>
