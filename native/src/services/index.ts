import { isPreview } from "../lib/env";
import { fixtureCatalog, fixtureEnrollment, guestAuth, sandboxPayment } from "./fixture";
import { liveAuth, liveCatalog, liveEnrollment, livePayment } from "./live";
import type { Services } from "./types";

export function createServices(): Services {
  if (isPreview) {
    return {
      catalog: fixtureCatalog,
      enrollment: fixtureEnrollment,
      payment: sandboxPayment,
      auth: guestAuth,
    };
  }
  return {
    catalog: liveCatalog,
    enrollment: liveEnrollment,
    payment: livePayment,
    auth: liveAuth,
  };
}

export const services = createServices();
