import { IBuildPlugin } from "../@types";

export function load() {}

export function unload() {}

export const configs: Record<string, IBuildPlugin> = {
  "web-mobile": {
    hooks: "./hooks",
    options: {
      needMerge: {
        label: "need merge",
        description: "merge to a single html file",
        default: "false",
        render: {
          ui: "ui-checkbox",
        },
      },
      adNetwork: {
        label: "ad network",
        description: "input ad network",
        default: "test",
        render: {
          ui: "ui-select",
          items: [
            { label: "test", value: "test" },
            { label: "applovin", value: "applovin" },
            { label: "facebook", value: "facebook" },
            { label: "google", value: "google" },
            { label: "ironsource", value: "ironsource" },
            { label: "mintegral", value: "mintegral" },
            { label: "unity", value: "unity" },
          ],
        },
      },
    },
  },
};
