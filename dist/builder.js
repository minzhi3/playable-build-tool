"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.configs = {
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
                        { label: "ironsource", value: "ironsource" },
                    ],
                },
            },
        },
    },
};
