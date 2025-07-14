require("ts-node/register");
const assert = require("assert");

(async () => {
  const { default: Dashboard } = await import(
    "../frontend/src/pages/Dashboard"
  );
  const { default: StatusWidget } = await import(
    "../frontend/src/components/widgets/StatusWidget"
  );
  assert.equal(typeof Dashboard, "function");
  assert.equal(typeof StatusWidget, "function");
  console.log("Lazy modules test passed");
})();
