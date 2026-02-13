"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var url_1 = require("url");
var vite_1 = require("@tailwindcss/vite");
var vite_2 = require("vite");
var vite_3 = require("@react-router/dev/vite");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
// https://vite.dev/config/
exports.default = (0, vite_2.defineConfig)({
    plugins: [(0, vite_3.reactRouter)(), (0, vite_1.default)()],
    resolve: {
        alias: {
            "@": path_1.default.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3000'
        }
    }
});
