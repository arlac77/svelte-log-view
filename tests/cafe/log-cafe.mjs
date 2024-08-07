import { Selector } from "testcafe";

const base = "http://localhost:5173/";

fixture`log`.page`${base}`;

test("several lines", async t => {
  await t.wait(100);

  await t.expect(Selector("#log").innerText).contains("line 30\nline 31");
  //await t.expect(Selector("#offsetRows").value).contains("11");
  //await t.expect(Selector("#selected").value).contains("20");
  await t.expect(Selector("#follow").checked).eql(true);

  await t.pressKey("g");
  await t.wait(100);

  await t.expect(Selector("#log").innerText).contains("line 0");
  await t.expect(Selector("#offsetRows").value).contains("0");
  await t.expect(Selector("#selected").value).contains("0");
  await t.expect(Selector("#follow").checked).eql(false);

  await t.pressKey("down");
  await t.wait(100);
  await t.pressKey("down");
  await t.wait(100);

  await t.expect(Selector("#log").innerText).contains("line 2");
  await t.expect(Selector("#offsetRows").value).contains("0");
  await t.expect(Selector("#selected").value).contains("2");
  await t.expect(Selector("#follow").checked).eql(false);

  await t.pressKey("G");
  await t.wait(500);

  await t.expect(Selector("#log").innerText).contains("line 38");
  //await t.expect(Selector("#offsetRows").value).contains("11");
  //await t.expect(Selector("#selected").value).contains("20");
  await t.expect(Selector("#follow").checked).eql(false);

  await t.pressKey("g");
  await t.wait(100);

  /*
  await t.pressKey("up");
  await t.wait(1000);
  await t.expect(Selector("#offsetRows").value).contains("0");
  await t.expect(Selector("#selected").value).contains("0");
  await t.expect(Selector("#log").innerText).contains("line 0");

  await t.pressKey("f");
  await t.wait(2000);

  await t.expect(Selector("#log").innerText).contains("line 40");
  await t.expect(Selector("#follow").checked).eql(true);

  await t.pressKey("f");
  await t.expect(Selector("#follow").checked).eql(false);
  */
});
