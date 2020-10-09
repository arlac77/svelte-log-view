import { Selector } from "testcafe";

const base = "http://localhost:5000/base";

fixture`log`.page`${base}/index.html`;

test("several lines", async t => {
  await t.wait(2000);
  const log = Selector("#log");

  await t.expect(Selector("#follow").innerText).contains("F");

  await t
    .expect(Selector("#log").innerText)
    .contains("line 11\nline 12\nline 13\n");


  await t.click(log).pressKey("g");
  await t.wait(100);
  
  await t.expect(Selector("#log").innerText).contains("line 1");
  await t.expect(Selector("#start").innerText).contains("0");
  await t.expect(Selector("#selected").innerText).contains("0");
  await t.expect(Selector("#follow").innerText).contains("-");

  await t.click(log).pressKey("down");
  await t.wait(100);
  await t.click(log).pressKey("down");
  await t.wait(100);

  await t.expect(Selector("#log").innerText).contains("line 3");
  await t.expect(Selector("#start").innerText).contains("0");
  await t.expect(Selector("#selected").innerText).contains("2");
  await t.expect(Selector("#follow").innerText).contains("-");

  await t.click(log).pressKey("G");
  await t.wait(1000);
  
  await t.expect(Selector("#log").innerText).contains("line 20");
  await t.expect(Selector("#start").innerText).contains("10");
  await t.expect(Selector("#selected").innerText).contains("19");
  await t.expect(Selector("#follow").innerText).contains("-");


  await t.click(log).pressKey("g");
  await t.wait(100);
  await t.click(log).pressKey("up");
  await t.wait(1000);
  //await t.expect(Selector("#start").innerText).contains("0");
  //await t.expect(Selector("#selected").innerText).contains("0");
  await t.expect(Selector("#log").innerText).contains("line 0");

  await t.click(log).pressKey("f");
  await t.wait(2000);

  await t.expect(Selector("#log").innerText).contains("line 40");
  await t.expect(Selector("#follow").innerText).contains("F");

  await t.click(log).pressKey("f");
  await t.expect(Selector("#follow").innerText).contains("-");
});
