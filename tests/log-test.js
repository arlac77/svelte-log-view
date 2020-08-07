import { Selector } from "testcafe";

const base = "http://localhost:5000/base";

fixture`log`.page`${base}/index.html`;

test("several lines", async t => {
  await t.wait(4000);
  await t.expect(Selector('#log').innerText).contains('line 1\nline 2\nline 3\nline 4\n');
});

