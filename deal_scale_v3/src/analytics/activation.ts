export const ACTIVATION_EVENT = "deal_scale_app_activated" as const;

export type ActivationEvent = {
  event: typeof ACTIVATION_EVENT;
  workspaceId: string;
  appVersion: string;
};

export type ActivationSink = {
  capture: (event: string, properties: Record<string, string>) => void;
};

export const createActivationEvent = ({
  workspaceId,
  appVersion,
}: Omit<ActivationEvent, "event">): ActivationEvent => ({
  event: ACTIVATION_EVENT,
  workspaceId,
  appVersion,
});

export const emitActivationEvent = (
  sink: ActivationSink,
  event: ActivationEvent,
) => {
  sink.capture(event.event, {
    workspace_id: event.workspaceId,
    app_version: event.appVersion,
  });
};
