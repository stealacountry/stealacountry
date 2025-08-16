const dom = {
  GridWrap: document.getElementById("grid"),
  SearchBox: document.getElementById("search"),
  Sorting_DemandWrap: document.getElementById("sorting-demand"),
  Sorting_RarityWrap: document.getElementById("sorting-rarity"),
  Sorting_Mutation1Wrap: document.getElementById("sorting-multiplier"),
  Sorting_Mutation2Wrap: document.getElementById("sorting-mutation"),
  Sorting_AlphabetWrap: document.getElementById("sorting-alphabet"),
  FooterBox: document.getElementById("footer-box")
};

const Sorting_Demand = ["N/A","0/10","1/10","2/10","3/10","4/10","5/10","6/10","7/10","8/10","9/10","10/10"];
const Sorting_Rarity = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Godly", "Secret", "Limited"];
const Sorting_Mutation1 = ["Normal","Gold","Diamond","Emerald","Rainbow"];
const Sorting_Mutation2 = ["None","Magma","Toxic","Cosmic"];
const Sorting_Alphabet = ["A-Z","Z-A"];

let units = [];
let sorting = {
  demand: "",
  rarity: "",
  mutation_1: "",
  mutation_2: [],
  alphabet: ""
};

function SafeHTML(s){
  if(s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function prettyNumber(n){
  if(n === null || n === undefined) return "N/A";
  const num = parseFloat(String(n).replace(/,/g,""));
  if(Number.isNaN(num)) return String(n);
  return num.toLocaleString();
}

function RenderCard(unit){
  const card = document.createElement("div");
  card.className = "card";

  const imgHref = unit.image || "";
  const mutation2Display = (unit.mutation_2 && unit.mutation_2.length) ? unit.mutation_2.join(", ") : "None";
  const mutation1Display = (unit.mutation_1 && (Array.isArray(unit.mutation_1) ? unit.mutation_1.join(", ") : unit.mutation_1)) || "Normal";

  card.innerHTML = `
    <img src="${imgHref}" alt="${SafeHTML(unit.name)}" onerror="this.style.opacity=.45">

    <div class="values">
      <div class="value-row"><div class="value-label">Name:</div><div class="value-data">${SafeHTML(unit.name)}</div></div>
      ${unit.copies !== undefined ? `<div class="value-row"><div class="value-label">Copies:</div><div class="value-data">${SafeHTML(unit.copies)}</div></div>` : ""}
      <div class="value-row"><div class="value-label">Demand:</div><div class="value-data">${SafeHTML(unit.demand ?? "N/A")}</div></div>
      <div class="value-row"><div class="value-label">Rarity:</div><div class="value-data">${SafeHTML(unit.rarity ?? "N/A")}</div></div>
      <div class="value-row"><div class="value-label">Mutation #1:</div><div class="value-data">${SafeHTML(mutation1Display)}</div></div>
      <div class="value-row"><div class="value-label">Mutation #2:</div><div class="value-data">${SafeHTML(mutation2Display)}</div></div>
      <div class="value-row"><div class="value-label">Income:</div><div class="value-data">${SafeHTML(unit.income ?? "N/A")}</div></div>
      <div class="value-row"><div class="value-label">Cost:</div><div class="value-data">${unit.cost ? prettyNumber(unit.cost) : "N/A"}</div></div>
    </div>
  `;
  return card;
}

function Render_Cards(list){
  dom.GridWrap.innerHTML = "";
  list.forEach(u => dom.GridWrap.appendChild(RenderCard(u)));
}

function Apply_Sorting(){
  const q = dom.SearchBox.value.trim().toLowerCase();
  let out = units.slice();

  if(sorting.demand) out = out.filter(u => (u.demand ?? "").toString() === sorting.demand);
  if(sorting.rarity) out = out.filter(u => (u.rarity ?? "").toString() === sorting.rarity);
  if(sorting.mutation_1){
    out = out.filter(u => {
      const unitMut = u.mutation_1 ? (Array.isArray(u.mutation_1) ? u.mutation_1 : [u.mutation_1]) : ["Normal"];
      return unitMut.includes(sorting.mutation_1);
    });
  }
  if(sorting.mutation_2.length){
    const wantNone = sorting.mutation_2.includes("None");
    const otherDesired = sorting.mutation_2.filter(m => m !== "None");
    out = out.filter(u => {
      const unitMut = Array.isArray(u.mutation_2) ? u.mutation_2 : (u.mutation_2 ? [u.mutation_2] : []);
      const hasNone = unitMut.length === 0 || (unitMut.length === 1 && unitMut[0] === "None");
      if(wantNone && otherDesired.length === 0) return hasNone;
      const matchesOther = otherDesired.every(d => unitMut.includes(d));
      if(wantNone) return hasNone && matchesOther;
      return matchesOther;
    });
  }

  if(q){
    out = out.filter(u => {
      const name = (u.name ?? "").toLowerCase();
      const rarity = (u.rarity ?? "").toLowerCase();
      return name.includes(q) || rarity.includes(q);
    });
  }

  if(sorting.alphabet === "A-Z") out.sort((a,b)=> a.name.localeCompare(b.name));
  if(sorting.alphabet === "Z-A") out.sort((a,b)=> b.name.localeCompare(a.name));

  Render_Cards(out);
}

function Make_SortButton(text, container, key, single){
  const button = document.createElement("div");
  button.className = "button";
  button.textContent = text;
  button.dataset.value = text;
  button.addEventListener("click", ()=>{

    if(key === "mutation_2"){
      if(text === "None"){
        if(sorting.mutation_2.includes("None")){
          sorting.mutation_2 = [];
          button.classList.remove("active");
        } else {
          sorting.mutation_2 = ["None"];
          container.querySelectorAll(".button").forEach(b=>b.classList.remove("active"));
          button.classList.add("active");
        }
      } else {
        if(sorting.mutation_2.includes(text)){
          sorting.mutation_2 = sorting.mutation_2.filter(m=>m!==text);
          button.classList.remove("active");
        } else {
          sorting.mutation_2 = sorting.mutation_2.filter(m=>m!=="None");
          sorting.mutation_2.push(text);
          container.querySelectorAll(".button").forEach(b=>{
            if(b.dataset.value === "None") b.classList.remove("active");
          });
          button.classList.add("active");
        }
      }

    } else if(single){
      if(sorting[key] === text){
        sorting[key] = "";
        button.classList.remove("active");
      } else {
        container.querySelectorAll(".button").forEach(b=>b.classList.remove("active"));
        sorting[key] = text;
        button.classList.add("active");
      }
    } else {
      const idx = sorting[key].indexOf(text);
      if(idx >= 0){
        sorting[key].splice(idx,1);
        button.classList.remove("active");
      } else {
        sorting[key].push(text);
        button.classList.add("active");
      }
    }
      Apply_Sorting();
  });
  container.appendChild(button);
}

function Create_SortButtons(){
  Sorting_Demand.forEach(d => Make_SortButton(d, dom.Sorting_DemandWrap, "demand", true));
  Sorting_Rarity.forEach(r => Make_SortButton(r, dom.Sorting_RarityWrap, "rarity", true));
  Sorting_Mutation1.forEach(m => Make_SortButton(m, dom.Sorting_Mutation1Wrap, "mutation_1", true));
  Sorting_Mutation2.forEach(m => Make_SortButton(m, dom.Sorting_Mutation2Wrap, "mutation_2", false));
  Sorting_Alphabet.forEach(o => Make_SortButton(o, dom.Sorting_AlphabetWrap, "alphabet", true));
}

async function Load_Cards(){
  const res = await fetch("./cardinfo.json");
  units = await res.json();
  units.forEach(u=>{
    if(!u.mutation_2) u.mutation_2 = [];
    if(!u.mutation_1) u.mutation_1 = "Normal";
  });
  Render_Cards(units);
}

dom.SearchBox.addEventListener("input", ()=>Apply_Sorting());

Create_SortButtons();
Load_Cards();
