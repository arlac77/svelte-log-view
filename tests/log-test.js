import { Selector } from "testcafe";

const base = "http://localhost:5000/base";

fixture`log`.page`${base}/index.html`;

test("several lines", async t => {
  const log = Selector(".log");

  await t.expect(log.value).contains('line 1');
  //await t.expect(Selector(".log").innerText).eql("line 1");
});

