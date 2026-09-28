package expo.modules.masrawidgetclock

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Schedules a one-shot alarm that re-triggers a home-screen widget's normal update
 * (ACTION_APPWIDGET_UPDATE → RNWidgetProvider.onUpdate → widgetTaskHandler "WIDGET_UPDATE").
 *
 * Every render schedules the next one, so the widget keeps itself fresh with the app closed.
 * Alarms are RTC (non-wakeup): they never wake a sleeping phone — a refresh that fell due while
 * the screen was off fires the moment the screen turns on, which is exactly when it's visible.
 */
class MasraWidgetClockModule : Module() {
  private val context: Context
    get() = appContext.reactContext?.applicationContext ?: throw Exceptions.ReactContextLost()

  private val alarmManager: AlarmManager
    get() = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

  override fun definition() = ModuleDefinition {
    Name("MasraWidgetClock")

    /** @return "exact", "inexact", or "no-widgets" (nothing on the home screen, so nothing scheduled) */
    Function("scheduleRefresh") { widgetName: String, triggerAtMs: Double ->
      val pending = buildPendingIntent(widgetName) ?: run {
        cancel(widgetName)
        return@Function "no-widgets"
      }
      val triggerAt = triggerAtMs.toLong()

      if (canScheduleExact()) {
        try {
          alarmManager.setExact(AlarmManager.RTC, triggerAt, pending)
          return@Function "exact"
        } catch (e: SecurityException) {
          // Permission revoked between the check and the call — fall through to inexact.
        }
      }
      alarmManager.setWindow(AlarmManager.RTC, triggerAt, INEXACT_WINDOW_MS, pending)
      "inexact"
    }

    Function("cancelRefresh") { widgetName: String ->
      cancel(widgetName)
    }

    Function("canScheduleExactAlarms") {
      canScheduleExact()
    }

    /** Opens the system "Alarms & reminders" page for this app (Android 12+). */
    Function("openExactAlarmSettings") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
          .setData(Uri.parse("package:" + context.packageName))
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
      }
    }
  }

  private fun canScheduleExact(): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      return alarmManager.canScheduleExactAlarms()
    }
    return true
  }

  /**
   * The react-native-android-widget config plugin generates one provider class per widget,
   * named after the widget ("<package>.widget.<WidgetName>"). We look it up among this app's
   * installed providers instead of hard-coding the package path.
   */
  private fun findProvider(widgetName: String): ComponentName? =
    AppWidgetManager.getInstance(context).installedProviders
      .map { it.provider }
      .firstOrNull { it.packageName == context.packageName && it.className.substringAfterLast('.') == widgetName }

  private fun buildPendingIntent(widgetName: String): PendingIntent? {
    val provider = findProvider(widgetName) ?: return null
    val ids = AppWidgetManager.getInstance(context).getAppWidgetIds(provider)
    if (ids.isEmpty()) return null

    val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
      .setComponent(provider)
      .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
    return PendingIntent.getBroadcast(
      context,
      requestCode(widgetName),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun cancel(widgetName: String) {
    val provider = findProvider(widgetName) ?: return
    val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).setComponent(provider)
    val existing = PendingIntent.getBroadcast(
      context,
      requestCode(widgetName),
      intent,
      PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
    ) ?: return
    alarmManager.cancel(existing)
    existing.cancel()
  }

  private fun requestCode(widgetName: String) = 0x4D57 xor widgetName.hashCode()

  companion object {
    // Minimum the OS honours for inexact windows varies by version; this is our request.
    private const val INEXACT_WINDOW_MS = 60_000L
  }
}
