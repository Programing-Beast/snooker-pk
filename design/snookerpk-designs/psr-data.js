/* ============================================================
   SnookerPK · Profile / Rankings / Store — data
   ============================================================ */
function flag(cc, w = 22, h = 15) {
  const bands = {
    PAK: `<i style="background:#016d31"></i><i style="background:#fff;flex:0 0 ${Math.round(w*0.3)}px"></i>`,
    ENG: `<i style="background:#fff"></i>`, CHN: `<i style="background:#de2910"></i>`,
  };
  return `<span class="fg" style="width:${w}px;height:${h}px">${bands[cc]||bands.PAK}</span>`;
}
function initials(n){ return n.split(' ').map(x=>x[0]).join('').replace(/\./g,'').slice(0,2); }

/* ---- rankings dataset ---- */
const RANKING = [
  { rank:1,  n:'M. Asif',    cc:'PAK', tier:'Pro', played:12, pts:1284, form:['W','W','W','L','W'] },
  { rank:2,  n:'S. Khan',    cc:'PAK', tier:'Pro', played:12, pts:1150, form:['W','L','W','W','W'] },
  { rank:3,  n:'D. Junhui',  cc:'CHN', tier:'Pro', played:11, pts:986,  form:['L','W','W','L','W'] },
  { rank:4,  n:'A. Mehmood', cc:'PAK', tier:'Pro', played:12, pts:902,  form:['W','W','L','W','L'] },
  { rank:5,  n:'J. Trump',   cc:'ENG', tier:'Pro', played:10, pts:870,  form:['W','L','W','W','L'] },
  { rank:6,  n:'B. Sajjad',  cc:'PAK', tier:'Am',  played:10, pts:748,  form:['W','W','W','L','W'] },
  { rank:7,  n:'N. Hussain', cc:'PAK', tier:'Pro', played:11, pts:690,  form:['L','W','L','W','W'] },
  { rank:8,  n:'R. Walker',  cc:'ENG', tier:'Am',  played:9,  pts:612,  form:['L','L','W','W','L'] },
  { rank:9,  n:'K. Iqbal',   cc:'PAK', tier:'Pro', played:10, pts:540,  form:['W','L','L','W','L'] },
  { rank:10, n:'Z. Ali',     cc:'PAK', tier:'Pro', played:9,  pts:498,  form:['L','W','L','L','W'] },
  { rank:11, n:'T. Aslam',   cc:'PAK', tier:'Am',  played:8,  pts:430,  form:['W','L','W','L','L'] },
  { rank:12, n:'H. Raza',    cc:'PAK', tier:'Am',  played:8,  pts:388,  form:['L','L','W','L','W'] },
];

/* ---- profile (M. Asif) ---- */
const PROFILE = {
  n:'Muhammad Asif', short:'M. Asif', cc:'PAK', tier:'Pro', rank:1, seed:1,
  city:'Karachi', age:39, turnedPro:2005,
  photo:'https://i.pravatar.cc/240?img=12',
  bio:'Two-time IBSF World Champion and Pakistan’s #1 ranked player. Known for a patient safety game and a ruthless long pot, Asif has anchored the national side for over a decade and remains the man to beat on home baize.',
  stats:[
    { k:'Ranking points', v:'1,284' },
    { k:'Titles', v:'7' },
    { k:'Highest break', v:'147' },
    { k:'Win rate', v:'78%' },
  ],
  history:[
    { ev:'Karachi National Open ’26', res:'Quarter-final', state:'live', date:'Jun 2026' },
    { ev:'Peshawar Cup ’26',          res:'Winner',        state:'win',  date:'May 2026' },
    { ev:'Quetta Challenge ’26',      res:'Semi-final',    state:'sf',   date:'Apr 2026' },
    { ev:'Lahore Masters ’25',        res:'Runner-up',     state:'ru',   date:'Dec 2025' },
    { ev:'Islamabad Invitational ’25',res:'Winner',        state:'win',  date:'Oct 2025' },
    { ev:'National Open ’25',         res:'Quarter-final', state:'done', date:'Jun 2025' },
  ],
  upcoming:[
    { ev:'Lahore Masters ’26', date:'2–6 Jul 2026', venue:'Royal Cue Lounge, Lahore' },
    { ev:'Islamabad Invitational ’26', date:'18–22 Jul 2026', venue:'Capital Club, Islamabad' },
  ],
  h2h:[
    { n:'S. Khan',   cc:'PAK', w:6, l:4 },
    { n:'A. Mehmood',cc:'PAK', w:7, l:2 },
    { n:'D. Junhui', cc:'CHN', w:4, l:4 },
    { n:'J. Trump',  cc:'ENG', w:3, l:5 },
  ],
};

/* ---- store products (coming soon) ---- */
const PRODUCTS = [
  { n:'Pro Maple Snooker Cue — 9.5mm', brand:'Cue Masters', price:'14,500', ic:'cue' },
  { n:'Tournament Chalk — Box of 12',  brand:'Triangle',     price:'1,200',  ic:'chalk' },
  { n:'3/4 Leather Cue Case',          brand:'Cue Masters',  price:'8,900',  ic:'case' },
  { n:'Crystal Ball Set — Tournament', brand:'Aramith',      price:'22,000', ic:'balls' },
  { n:'Telescopic Cue Extension',      brand:'Peradon',      price:'3,400',  ic:'ext' },
  { n:'Rest & Spider Set',             brand:'Cue Masters',  price:'2,800',  ic:'rest' },
];
