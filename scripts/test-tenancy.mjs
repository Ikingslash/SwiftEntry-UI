import test from "node:test";
import assert from "node:assert/strict";
import { runIsolationChecks } from "../src/tenancy/isolationChecks.js";

test("tenant isolation matrix", () => {
  const result = runIsolationChecks();
  const failures = result.checks.filter((c) => !c.pass);
  assert.equal(
    result.failed,
    0,
    `Isolation failures:\n${failures.map((f) => `- ${f.name}: ${f.detail}`).join("\n")}`
  );
  assert.ok(result.passed >= 10, "Expected at least 10 isolation checks");
});
