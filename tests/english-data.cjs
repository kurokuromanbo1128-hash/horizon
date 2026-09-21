const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.join(__dirname, '..');
const base = process.env.HORIZON_BASE || '767c1c2acd413251c80486f1ba529619a7445878';
const readBase = file => process.env.HORIZON_BASE_DIR
    ? fs.readFileSync(path.join(process.env.HORIZON_BASE_DIR, file), 'utf8')
    : execFileSync('git', ['show', `${base}:${file}`], {cwd: root, encoding: 'utf8'});
const parse = source => JSON.parse(JSON.stringify(vm.runInNewContext(source + ';dailyEnglish')));
const data = parse(fs.readFileSync(path.join(root, 'english.js'), 'utf8'));
const original = parse(readBase('english.js'));
const categories = ['Morning', 'Conversation', 'Snowboard', 'Photography', 'Beach', 'Meeting Someone'];
function normalize(text){
    return text.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
        .replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot')
        .replace(/\bcan not\b/g, 'cannot').replace(/n't\b/g, ' not')
        .replace(/\bi'm\b/g, 'i am').replace(/'re\b/g, ' are')
        .replace(/'ll\b/g, ' will').replace(/'ve\b/g, ' have')
        .replace(/[^a-z0-9]/g, '');
}
assert.equal(original.length, 300, 'Baseline must contain 300 phrases');
assert.equal(data.length, 600);
assert.deepEqual([...new Set(data.map(x => x.category))], categories);
const seen = new Set();
for(const item of data){
    assert.deepEqual(Object.keys(item).sort(), ['category','japanese','text','thought']);
    for(const key of Object.keys(item)) assert.ok(typeof item[key] === 'string' && item[key].trim(), key);
    assert.match(item.text, /[A-Za-z]/);
    assert.match(item.japanese, /[ぁ-んァ-ヶ一-龠]/u);
    assert.ok(!/____|TODO|TBD/.test(item.text + item.japanese));
    const key = normalize(item.text);
    assert.ok(!seen.has(key), `Duplicate: ${item.category}: ${item.text}`);
    seen.add(key);
}
// The user authorized replacing existing duplicates. Every other object stays at its original category index.
const oldSeen = new Set();
let retained = 0, replaced = 0;
for(const category of categories){
    const before = original.filter(x => x.category === category);
    const after = data.filter(x => x.category === category);
    assert.equal(after.length, 100, category);
    assert.equal(before.length, category === 'Morning' ? 100 : 40);
    before.forEach((item,index) => {
        const key = normalize(item.text);
        if(oldSeen.has(key)){
            assert.notEqual(after[index].text, item.text, 'Replace old duplicate at the same index');
            assert.notEqual(after[index].japanese, item.japanese, 'Update the matching translation');
            replaced++;
        }else{
            assert.deepEqual(after[index], item, `Preserve ${category} #${index+1}`);
            retained++;
        }
        oldSeen.add(key);
    });
    for(const item of after.slice(before.length)){
        assert.ok(item.text.split(/\s+/).length <= 16, `Keep new phrases short: ${item.text}`);
    }
    console.log(`PASS ${category}: ${before.length} -> ${after.length}`);
}
assert.equal(replaced,13);
assert.equal(retained,287);
// Guard every runtime file outside the phrase bank, including Night, UI, storage and PWA.
for(const file of ['app.js','ai-night-talk.js','night-guide.js','index.html','style.css','manifest.json','service-worker.js']){
    assert.equal(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'), readBase(file).replace(/\r\n/g,'\n'), `Runtime changed: ${file}`);
}
console.log('PASS 600 unique bilingual objects; 287 original objects retained in order, 13 duplicate slots replaced; all other runtime files unchanged');
