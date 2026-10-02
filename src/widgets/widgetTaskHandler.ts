import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { MasraPalaceWidgetController } from './masraPalace';

// Runs headless (the app does not need to be open) when the user adds a
// widget (WIDGET_ADDED), on updates (WIDGET_UPDATE — every minute through the
// masra-widget-clock alarm, or every 30 minutes from Android as a fallback),
// on resize (WIDGET_RESIZED) and on tap (WIDGET_CLICK).
//
// Both widgets (4×2 "MasraPalaceWidget" and 2×2 "PrayerWidget") compute their
// own times — see src/widgets/masraPalace. Android only: the iPhone widget is
// written in Swift (targets/widget).
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetName } = props.widgetInfo;
  if (!MasraPalaceWidgetController.handles(widgetName)) return;

  if (props.widgetAction === 'WIDGET_DELETED') {
    // Reschedule (or cancel if no instance is left) — the native module
    // returns "no-widgets" and cancels the alarm itself in that case.
    MasraPalaceWidgetController.rescheduleOrCancel(widgetName);
    return;
  }

  // clickAction="OPEN_APP" opens the app on tap; the widget is redrawn in
  // every case (added, update, resize, click).
  props.renderWidget(await MasraPalaceWidgetController.buildElement(null, props.widgetInfo, widgetName));
}
