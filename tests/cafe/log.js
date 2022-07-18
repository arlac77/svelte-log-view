import { Selector } from "testcafe";

const base = "http://localhost:5173/examples/svelte-log-view/";

fixture`log`.page`${base}`;

test("several lines", async t => {
  await t.wait(2000);
  const log = Selector("#log");

  await t.expect(Selector("#follow").innerText).contains("F");

  await t
    .expect(Selector("#log").innerText)
    .contains("line 12\nline 13\nline 14\n");
  await t.click(log).pressKey("g");
  await t.wait(100);
  
  await t.expect(Selector("#log").innerText).contains("line 1");
  await t.expect(Selector("#start").innerText).contains("line 0");
  await t.expect(Selector("#selected").innerText).contains("line 0");
  await t.expect(Selector("#follow").innerText).contains("-");

  await t.click(log).pressKey("down");
  await t.wait(100);
  await t.click(log).pressKey("down");
  await t.wait(100);

  await t.expect(Selector("#log").innerText).contains("line 3");
  await t.expect(Selector("#start").innerText).contains("line 1");
  await t.expect(Selector("#selected").innerText).contains("line 2");
  await t.expect(Selector("#follow").innerText).contains("-");

  await t.click(log).pressKey("G");
  await t.wait(1000);
  
  await t.expect(Selector("#log").innerText).contains("line 21");
  await t.expect(Selector("#start").innerText).contains("line 12");
  await t.expect(Selector("#selected").innerText).contains("line 21");
  await t.expect(Selector("#follow").innerText).contains("-");


  await t.click(log).pressKey("g");
  await t.wait(100);
  await t.click(log).pressKey("up");
  await t.wait(1000);
  await t.expect(Selector("#start").innerText).contains("line 1");
  await t.expect(Selector("#selected").innerText).contains("line 1");
  await t.expect(Selector("#log").innerText).contains("line 1");

  await t.click(log).pressKey("f");
  await t.wait(2000);

  await t.expect(Selector("#log").innerText).contains("line 40");
  await t.expect(Selector("#follow").innerText).contains("F");

  await t.click(log).pressKey("f");
  await t.expect(Selector("#follow").innerText).contains("-");
});
