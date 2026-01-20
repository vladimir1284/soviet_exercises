import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries, fromBoolean } from '$db';

// Update settings
export const PATCH: RequestHandler = async ({ request, platform }) => {
  const db = platform?.env?.DB;
  if (!db) {
    return json({ error: 'Database not available' }, { status: 500 });
  }

  try {
    const { userId, ...data } = await request.json();

    if (!userId) {
      return json({ error: 'User ID required' }, { status: 400 });
    }

    // Convert to DB format
    const updateData: Record<string, any> = {};
    if (data.defaultSetsPerDay !== undefined) updateData.default_sets_per_day = data.defaultSetsPerDay;
    if (data.defaultDaysPerWeek !== undefined) updateData.default_days_per_week = data.defaultDaysPerWeek;
    if (data.defaultCycleWeeks !== undefined) updateData.default_cycle_weeks = data.defaultCycleWeeks;
    if (data.restDays !== undefined) updateData.rest_days = JSON.stringify(data.restDays);
    if (data.notificationEnabled !== undefined) updateData.notification_enabled = fromBoolean(data.notificationEnabled);
    if (data.notificationTime !== undefined) updateData.notification_time = data.notificationTime;

    const settings = await queries.updateSettings(db, userId, updateData);

    if (!settings) {
      return json({ error: 'Settings not found' }, { status: 404 });
    }

    return json({
      defaultSetsPerDay: settings.default_sets_per_day,
      defaultDaysPerWeek: settings.default_days_per_week,
      defaultCycleWeeks: settings.default_cycle_weeks,
      restDays: JSON.parse(settings.rest_days || '[]'),
      notificationEnabled: settings.notification_enabled === 1,
      notificationTime: settings.notification_time
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
