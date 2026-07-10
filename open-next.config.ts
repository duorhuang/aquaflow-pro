import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  edgeExternals: [
    "@aws-sdk/nested-clients/sso",
    "@aws-sdk/nested-clients/sso-oidc",
    "@aws-sdk/nested-clients/sts",
    "@aws-sdk/nested-clients/signin"
  ]
} as any);