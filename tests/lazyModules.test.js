require("ts-node/register");
const assert = require("assert");

(async () => {
  const { default: Dashboard } = await import(
    "../frontend/src/pages/Dashboard"
  );
  const { default: StatusWidget } = await import(
    "../frontend/src/components/widgets/StatusWidget"
  );
  const { default: AppHeader } = await import(
    "../frontend/src/components/AppHeader"
  );
  const { default: AppSidebar } = await import(
    "../frontend/src/components/AppSidebar"
  );
  assert.equal(typeof Dashboard, "function");
  assert.equal(typeof StatusWidget, "function");
  assert.equal(typeof AppHeader, "function");
  assert.equal(typeof AppSidebar, "function");
  console.log("Lazy modules test passed");
})();
