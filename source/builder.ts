import { IBuildPlugin } from "../@types";

export function load() {}

export function unload() {}

export const configs: Record<string, IBuildPlugin> = {
  "web-mobile": {
    hooks: "./hooks",
    options: {
      isPlayable: {
        label: "i18n:playable-build-tool.isPlayable.label",
        description: "i18n:playable-build-tool.isPlayable.description",
        default: "false",
        render: {
          ui: "ui-checkbox",
        },
      },
      splitJs: {
        label: "i18n:playable-build-tool.splitJs.label",
        description: "i18n:playable-build-tool.splitJs.description",
        default: "false",
        render: {
          ui: "ui-checkbox",
        },
      },
      adNetwork: {
        label: "i18n:playable-build-tool.adNetwork.label",
        description: "i18n:playable-build-tool.adNetwork.description",
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
