import { Selector } from "testcafe";

const base = "http://localhost:5000/base";

fixture`log`.page`${base}/index.html`;

test("several lines", async t => {
  await t.wait(1000);
  await t
    .expect(Selector("#log").innerText)
    .contains("line 1\nline 2\nline 3\nline 4\n");

  await t.expect(Selector("#follow").innerText).contains("F");

  await t.pressKey("f");
  await t.expect(Selector("#follow").innerText).contains("-");

  await t.pressKey("f");
  await t.expect(Selector("#follow").innerText).contains("F");

  await t.wait(2000);

  await t.pressKey("g");
  await t.wait(200);
  await t.expect(Selector("#start").innerText).contains("0");

  await t.pressKey("G");
  await t.wait(500);
  await t.expect(Selector("#start").innerText).contains("9");

  await t
  .expect(Selector("#log").innerText)
  .contains("line 19\n");
});
