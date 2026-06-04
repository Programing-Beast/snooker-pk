/* ============================================================
   SnookerPK · Tournament Detail — data
   Karachi National Open '26 · mid-tournament snapshot
   ============================================================ */

const TOURNAMENT = {
  name: 'Karachi National Open',
  edition: '2026',
  status: 'live',
  dates: '12–18 Jun 2026',
  venue: 'Karachi Club',
  city: 'Karachi',
  cc: 'PAK',
  drawSize: 16,
  format: 'Knockout · single elimination',
  prizePool: '500,000',
  org: 'Cue Masters Pakistan',
  orgInit: 'CM',
  presentedBy: 'Sui Southern Sports',
};

/* country flag bands (abstract placeholders; swap licensed SVG at chip size) */
function flag(cc, w = 22, h = 15) {
  const bands = {
    PAK: `<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w * 0.3)}px"></i>`,
    ENG: `<i style="background:#fff"></i>`,
    CHN: `<i style="background:#de2910"></i>`,
    IND: `<i style="background:#ff9933"></i><i style="background:#fff"></i><i style="background:#138808"></i>`,
  };
  const col = cc === 'IND' ? ' col' : '';
  return `<span class="fg${col}" style="width:${w}px;height:${h}px">${bands[cc] || bands.PAK}</span>`;
}

/* players (name, country, tier, seed, city) */
const P = {
  asif:  { n: 'M. Asif',     cc: 'PAK', tier: 'Pro', seed: 1,  city: 'Karachi' },
  skhan: { n: 'S. Khan',     cc: 'PAK', tier: 'Pro', seed: 2,  city: 'Lahore' },
  junhui:{ n: 'D. Junhui',   cc: 'CHN', tier: 'Pro', seed: 3,  city: 'Guangzhou' },
  trump: { n: 'J. Trump',    cc: 'ENG', tier: 'Pro', seed: 4,  city: 'Bristol' },
  mehmood:{n: 'A. Mehmood',  cc: 'PAK', tier: 'Pro', seed: 5,  city: 'Karachi' },
  sajjad:{ n: 'B. Sajjad',   cc: 'PAK', tier: 'Am',  seed: 6,  city: 'Faisalabad' },
  hussain:{n: 'N. Hussain',  cc: 'PAK', tier: 'Pro', seed: 7,  city: 'Islamabad' },
  walker:{ n: 'R. Walker',   cc: 'ENG', tier: 'Am',  seed: 8,  city: 'Leeds' },
  aslam: { n: 'T. Aslam',    cc: 'PAK', tier: 'Am',  seed: 9,  city: 'Multan' },
  iqbal: { n: 'K. Iqbal',    cc: 'PAK', tier: 'Pro', seed: 10, city: 'Karachi' },
  yousuf:{ n: 'M. Yousuf',   cc: 'PAK', tier: 'Am',  seed: 11, city: 'Hyderabad' },
  fkhan: { n: 'F. Khan',     cc: 'PAK', tier: 'Am',  seed: 12, city: 'Peshawar' },
  raza:  { n: 'H. Raza',     cc: 'PAK', tier: 'Am',  seed: 13, city: 'Lahore' },
  zali:  { n: 'Z. Ali',      cc: 'PAK', tier: 'Pro', seed: 14, city: 'Quetta' },
  ahmed: { n: 'W. Ahmed',    cc: 'PAK', tier: 'Am',  seed: 15, city: 'Sialkot' },
  smehmood:{n:'S. Mehmood',  cc: 'PAK', tier: 'Am',  seed: 16, city: 'Karachi' },
  tbd:   { n: 'TBD', cc: null, tier: null, seed: null, city: null },
};

/* a match:
   { pos, a, b, sa, sb, st:'done'|'live'|'sched', frames:[[a,b]...], when, table, live:{frame,score}, note }
   special: st:'bye' (a advances), st:'wo' (a wins, b withdrew) */
const ROUNDS = [
  {
    key: 'r1', name: 'Round 1', sub: 'Last 16', bestOf: 7,
    matches: [
      { pos: 1, a: P.asif, b: P.ahmed, sa: 4, sb: 1, st: 'done', frames: [[80,12],[20,75],[88,0],[64,40],[71,33]] },
      { pos: 2, a: P.walker, b: P.aslam, sa: 4, sb: 3, st: 'done', frames: [[70,44],[33,61],[58,52],[18,72],[81,9],[40,67],[66,38]] },
      { pos: 3, a: P.mehmood, b: P.yousuf, sa: 4, sb: 0, st: 'done', frames: [[77,21],[64,40],[88,1],[59,46]] },
      { pos: 4, a: P.trump, b: P.fkhan, sa: 4, sb: 2, st: 'done', frames: [[91,0],[12,74],[68,40],[55,49],[34,70],[72,28]] },
      { pos: 5, a: P.junhui, b: P.raza, sa: 4, sb: 1, st: 'done', frames: [[84,8],[40,66],[71,33],[62,40],[78,12]] },
      { pos: 6, a: P.sajjad, b: P.iqbal, sa: 4, sb: 3, st: 'done', frames: [[60,52],[44,61],[70,30],[28,66],[81,17],[39,58],[64,44]] },
      { pos: 7, a: P.hussain, b: P.tbd, st: 'bye' },
      { pos: 8, a: P.skhan, b: P.smehmood, st: 'wo' },
    ],
  },
  {
    key: 'qf', name: 'Quarter-finals', sub: 'Last 8', bestOf: 9,
    matches: [
      { pos: 1, a: P.asif, b: P.walker, sa: 5, sb: 2, st: 'done', frames: [[74,21],[12,88],[67,40],[71,9],[33,82],[91,0],[64,45]] },
      { pos: 2, a: P.mehmood, b: P.trump, sa: 4, sb: 3, st: 'live', frames: [[70,30],[20,75],[81,12],[66,40],[33,72],[90,1],[28,64]], live: { frame: 8, score: '62–17', table: 'Table 1' } },
      { pos: 3, a: P.junhui, b: P.sajjad, sa: 3, sb: 5, st: 'done', frames: [[70,44],[25,78],[8,92],[66,39],[12,71],[55,30],[20,69],[18,77]] },
      { pos: 4, a: P.hussain, b: P.skhan, st: 'sched', when: 'Today 18:30', table: 'Table 2' },
    ],
  },
  {
    key: 'sf', name: 'Semi-finals', sub: 'Last 4', bestOf: 11,
    matches: [
      { pos: 1, a: P.asif, b: P.tbd, st: 'sched', when: '17 Jun · 14:00', table: 'Table 1' },
      { pos: 2, a: P.sajjad, b: P.tbd, st: 'sched', when: '17 Jun · 18:00', table: 'Table 1' },
    ],
  },
  {
    key: 'final', name: 'Final', sub: 'Championship', bestOf: 11,
    matches: [
      { pos: 1, a: P.tbd, b: P.tbd, st: 'sched', when: '18 Jun · 19:00', table: 'Show Table' },
    ],
  },
];

/* prize breakdown — sums to 500,000 */
const PRIZES = [
  { pos: 'Winner', amt: '200,000', hl: true },
  { pos: 'Runner-up', amt: '100,000' },
  { pos: 'Semi-finalists', amt: '50,000', each: '× 2' },
  { pos: 'Quarter-finalists', amt: '20,000', each: '× 4' },
  { pos: 'Highest break', amt: '20,000', note: 'bonus' },
];

/* entrants for Players tab (seed order) */
const ENTRANTS = [P.asif,P.skhan,P.junhui,P.trump,P.mehmood,P.sajjad,P.hussain,P.walker,P.aslam,P.iqbal,P.yousuf,P.fkhan,P.raza,P.zali,P.ahmed,P.smehmood];
