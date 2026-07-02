// Server entry — delegates to TanStack Start's bundled server entry.
// Required for prerender/preview flows that expect dist/server/server.js.
import handler from "@tanstack/react-start/server-entry";

export default handler;
