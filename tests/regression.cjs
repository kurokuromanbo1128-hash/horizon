// Run: npm install --no-save playwright@1.62.1 && npx playwright install chromium
// Then: node tests/regression.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const base = process.env.HORIZON_BASE || '3ebecaf12d7de6ee964e2bb5a0752205b237ecd8';
const readData = source => vm.runInNewContext(source + '; dailyEnglish');
const data = readData(fs.readFileSync(path.join(root, 'english.js'), 'utf8'));
const old = readData(execFileSync('git', ['show', `${base}:english.js`], {cwd: root}).toString());
const morning = data.filter(x => x.category === 'Morning');
assert.equal(morning.length, 100);
assert.equal(new Set(morning.map(x => x.text.toLowerCase().replace(/[^a-z0-9]/g, ''))).size, 100);
assert.equal(JSON.stringify(morning.slice(0,40)), JSON.stringify(old.filter(x => x.category === 'Morning')));
assert.equal(JSON.stringify(data.filter(x => x.category !== 'Morning')), JSON.stringify(old.filter(x => x.category !== 'Morning')));
for(const item of morning){
  assert.ok(item.text && /[ぁ-んァ-ヶ一-龠]/u.test(item.japanese) && item.thought);
  assert.deepEqual(Object.keys(item).sort(), ['category', 'japanese', 'text', 'thought']);
}
for(const file of ['service-worker.js', 'manifest.json']){
  assert.equal(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'), execFileSync('git',['show',`${base}:${file}`],{cwd:root}).toString().replace(/\r\n/g,'\n'));
}
console.log('PASS data: 100 unique Morning sentences; original 40 and all other categories unchanged; translations present; PWA files unchanged');
const server = http.createServer((req,res) => {
  const file = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if(!file.startsWith(root) || !fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  res.end(fs.readFileSync(file));
});
const aiUrl = 'https://horizon-ai.kurokuromanbo1128.workers.dev/**';
const correction = {meaning:'伝わりました',naturalEnglish:'I went shopping after work.',tip:'Good job!'};
(async () => {
 await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
 const browser = await chromium.launch({headless:true, ...(process.env.HORIZON_BROWSER ? {executablePath:process.env.HORIZON_BROWSER} : {})});
 try{
  const context = await browser.newContext({viewport:{width:390,height:844}});
  const errors=[];
  const page=await context.newPage();
  page.on('pageerror', e=>errors.push(e.message));
  await page.addInitScript(() => {
   window.SpeechRecognition = class {
    constructor(){window.testRecognition=this;}
    start(){if(window.testStartError) throw new Error('start failed'); this.onstart?.();}
    result(text){this.onresult({results:[[{transcript:text}]]});this.onend?.();}
    fail(){this.onerror?.({error:'not-allowed'});this.onend?.();}
   };
   window.testSpoken=[];
   window.speechSynthesis.speak = utterance => window.testSpoken.push(utterance.text);
  });
  const requests=[];
  await page.route(aiUrl, async route => {requests.push(route.request().postDataJSON());await route.fulfill({json:correction});});
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(()=>navigator.serviceWorker.controller || navigator.serviceWorker.getRegistration());
  const text = id => page.locator('#'+id).innerText();
  const stored = key => page.evaluate(key=>localStorage.getItem(key),key);
  const submit = async answer => {await page.locator('#nightTypedAnswer').fill(answer);await page.locator('#nightSubmitBtn').click();};
  await page.evaluate(()=>{currentPracticeIndex=99; showNextEnglish();});
  assert.equal(await text('phraseProgress'),'1 / 100');
  await page.locator('#prevEnglishBtn').click();
  assert.equal(await text('phraseProgress'),'100 / 100');
  await page.locator('#nextEnglishBtn').click();
  await page.locator('#listenBtn').click();
  await page.waitForFunction(()=>window.testSpoken.length>0);
  assert.equal(await page.evaluate(()=>window.testSpoken[0]), await text('englishSentence'));
  await page.locator('#speakBtn').click();
  await page.evaluate(()=>window.testRecognition.result(document.getElementById('englishSentence').textContent));
  assert.equal(await page.locator('#spokenCheck').isChecked(),true);
  await page.locator('#morningBtn').click();
  assert.equal(await stored('xp'),'10');assert.equal(await stored('altitude'),'10');assert.equal(await stored('streak'),'1');
  await page.locator('#morningBtn').click();assert.equal(await stored('altitude'),'10');
  await page.reload();assert.equal(await stored('xp'),'10');assert.equal(await page.locator('#spokenCheck').isChecked(),true);
  for(const category of ['Morning','Conversation','Snowboard','Photography','Beach','Meeting Someone']){
   await page.locator('#practiceMode').selectOption(category);
   assert.match(await text('englishCategory'),new RegExp(category));
   await page.locator('#nextEnglishBtn').click();await page.locator('#prevEnglishBtn').click();
  }
  await page.locator('#practiceOrder').selectOption('random');
  assert.equal(await page.locator('#prevEnglishBtn').isDisabled(),true);
  const before=await text('englishSentence');await page.locator('#nextEnglishBtn').click();assert.notEqual(await text('englishSentence'),before);
  await page.locator('#practiceOrder').selectOption('sequence');assert.equal(await page.locator('#prevEnglishBtn').isEnabled(),true);
  console.log('PASS Morning Listen/Speak/Previous/Next, 6 categories, random order, completion, XP/streak/localStorage reload and no duplicate reward');
  const labels=[['仕事','買い物','家で休む','外出','その他'],['良かった','忙しかった','疲れた','楽しかった','その他'],['仕事','休む','出かける','勉強','その他']];
  for(let q=0;q<3;q++){
   assert.equal(await text('nightProgress'),`${q+1} / 3`);
   for(const label of labels[q]){
    await page.getByRole('radio',{name:label,exact:true}).check();
    assert.equal(await page.locator('#nightGuide details[open]').count(),0);
    await page.locator('#nightGuide summary').nth(0).click();
    assert.match(await page.locator('#nightGuide details').nth(0).innerText(),/____/);
    await page.locator('#nightGuide summary').nth(1).click();
    const example=await page.locator('#nightGuide details p').nth(1).innerText();
    assert.ok(!example.includes('____'));assert.match(example,/[ぁ-んァ-ヶ一-龠]/u);
   }
   await page.locator('#nextNightBtn').click();
  }
  assert.equal(requests.length,0);
  console.log('PASS 3 questions × 5 options including Other, optional collapsed Hint/Build it; examples never auto-submit');
  // Skipping the first two questions must not complete Night Talk.
  await page.locator('#nextNightBtn').click();await page.locator('#nextNightBtn').click();
  await submit("I'm going to practice English tomorrow.");
  assert.equal(await stored('lastNightTalk'),null);
  await page.locator('#nightAiFeedback').getByText('Good job!',{exact:false}).waitFor();
  await page.locator('#nextNightBtn').click();
  await page.locator('#nightSpeakBtn').click();
  assert.equal(await page.locator('#nextNightBtn').isDisabled(),true);
  await page.evaluate(()=>window.testRecognition.result('I went shopping after work.'));
  await page.locator('#nightAiFeedback').getByText('Good job!',{exact:false}).waitFor();
  assert.equal(await stored('lastNightTalk'),null);
  await page.locator('#nextNightBtn').click();
  await page.unroute(aiUrl);await page.route(aiUrl,route=>route.fulfill({status:503,json:{error:'offline'}}));
  await submit('It was busy because I had a lot of work.');
  await page.locator('#nightAiFeedback').getByText('AI添削は一時的に利用できません。回答は受け付けました。',{exact:false}).waitFor();
  assert.equal(await page.locator('#nightSummary p').count(),3);
  assert.ok(await stored('lastNightTalk'));assert.equal(await stored('altitude'),'20');assert.equal(await stored('xp'),'10');
  await submit('<img src=x onerror=alert(1)>');assert.equal(await page.locator('#nightSummary img').count(),0);
  assert.equal(await stored('altitude'),'20');
  console.log('PASS speech + typing + AI success/503, all-three completion (including out of order), safe summary, existing reward save and no double award');
  await page.evaluate(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined;});
  await page.locator('#nightSpeakBtn').click();assert.match(await text('nightSpeechResult'),/入力欄/);
  await submit('I had fun today.');assert.equal(await page.locator('#nightTypedAnswer').inputValue(),'I had fun today.');
  await submit('   ');assert.match(await text('nightSpeechResult'),/入力するか/);
  await page.reload();assert.equal(await stored('altitude'),'20');
  await page.locator('#nightSpeakBtn').click();await page.evaluate(()=>window.testRecognition.fail());
  assert.equal(await page.locator('#nightSubmitBtn').isEnabled(),true);assert.match(await text('nightSpeechResult'),/入力欄/);
  await page.evaluate(()=>window.testStartError=true);await page.locator('#nightSpeakBtn').click();
  assert.equal(await page.locator('#nextNightBtn').isEnabled(),true);await page.evaluate(()=>window.testStartError=false);
  console.log('PASS unsupported recognition, permission error, synchronous start error, blank input and saved completion after reload');
  await page.unroute(aiUrl);await page.route(aiUrl,route=>route.abort());
  await submit('I worked today.');await page.locator('#nightAiFeedback').getByText('AI添削は一時的に利用できません。回答は受け付けました。',{exact:false}).waitFor();
  await page.unroute(aiUrl);await page.route(aiUrl,route=>route.fulfill({body:'not json',contentType:'text/plain'}));
  await submit('I worked today.');await page.locator('#nightAiFeedback').getByText('AI添削は一時的に利用できません。回答は受け付けました。',{exact:false}).waitFor();
  let pending=[];
  await page.unroute(aiUrl);await page.route(aiUrl,route=>pending.push(route));
  await submit('Old answer.');await page.waitForFunction(()=>document.querySelector('#nightAiFeedback').textContent.includes('Checking'));
  await page.locator('#nextNightBtn').click();
  for(const route of pending.splice(0)) await route.fulfill({json:{...correction,tip:'STALE'}}).catch(()=>{});
  assert.equal(await text('nightAiFeedback'),'');
  await submit('Timeout answer.');
  await page.locator('#nightAiFeedback').getByText('AI添削は一時的に利用できません。回答は受け付けました。',{exact:false}).waitFor({timeout:20000});
  for(const route of pending.splice(0)) await route.abort().catch(()=>{});
  console.log('PASS offline/malformed response/15-second timeout and stale response cancellation');
  await page.unroute(aiUrl);await page.route(aiUrl,route=>route.fulfill({json:correction}));
  await page.getByRole('radio',{name:'忙しかった',exact:true}).check();
  for(const summary of await page.locator('#nightGuide summary').all()) await summary.click();
  const screenshotDir=process.env.HORIZON_SCREENSHOTS;
  for(const width of [320,390,430,1280]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`horizontal overflow at ${width}`);
   for(const id of ['nightSpeakBtn','nightSubmitBtn','nextNightBtn'])assert.ok((await page.locator('#'+id).boundingBox()).height>=44);
   if(screenshotDir){fs.mkdirSync(screenshotDir,{recursive:true});await page.locator('#nightTalk').screenshot({path:path.join(screenshotDir,`night-${width}.png`)});}
  }
  await page.reload();
  for(let q=0;q<3;q++){
   assert.equal(await page.locator('#nightGuide details').count(),0);
   await page.locator('#nightSpeakBtn').click();
   await page.evaluate(answer=>window.testRecognition.result(answer), ['I worked today.','It was a good day.',"I'm going to rest tomorrow."][q]);
   await page.locator('#nightAiFeedback').getByText('Good job!',{exact:false}).waitFor();
   await page.locator('#nightRetryBtn').click();
   await page.evaluate(()=>window.testRecognition.result('I practiced English.'));
   await page.locator('#nightAiFeedback').getByText('Good job!',{exact:false}).waitFor();
   await page.locator('#nextNightBtn').click();
  }
  assert.equal(await page.locator('#nightSummary p').count(),3);
  assert.equal(await stored('altitude'),'20');
  console.log('PASS all 3 questions with Speak → AI Coach → Retry without Hint/Build it');
  assert.deepEqual(errors,[]);
  console.log('PASS 320/390/430/1280px layout, touch target sizes, service worker registration, no uncaught browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
