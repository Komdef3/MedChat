'use client';

import { useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';

let initialized = false;

export default function DatadogInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    datadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? '',
      clientToken: process.env.NEXT_PUBLIC_CLIENT_TOKEN ?? '',
      site: process.env.NEXT_PUBLIC_DATADOG_SITE ?? '',
      service: 'medchat',
      env: process.env.NODE_ENV,
      version: '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackResources: true,
      trackUserInteractions: true,
      trackLongTasks: true,
    });

    datadogRum.startSessionReplayRecording();
  }, []);

  return null;
}
