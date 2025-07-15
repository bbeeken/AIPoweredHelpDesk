require("ts-node/register");
const assert = require("assert");
const React = require("../frontend/node_modules/react");
const ReactDOMServer = require("../frontend/node_modules/react-dom/server");
const TicketTable = require("../frontend/src/TicketTable").default;

const tickets = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  question: `Q${i + 1}`,
  status: "open",
  priority: "low",
}));

const html = ReactDOMServer.renderToString(
  React.createElement(TicketTable, { filters: {}, tickets }),
);

assert(
  !html.includes("Q50"),
  "last ticket should not be rendered with virtual scroll",
);
console.log("Virtual scrolling test passed");
