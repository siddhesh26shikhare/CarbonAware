/* CarbonAware student prototype.
   Factors are illustrative kg CO2e per passenger-km, not official or vehicle-specific values.
   Replace them with a cited, region-appropriate dataset before presenting as validated results. */
(function(){
const options={
 petrolCar:{name:"Petrol car",icon:"🚗",factor:.19,kind:"car"},
 dieselCar:{name:"Diesel car",icon:"🚙",factor:.17,kind:"car"},
 cngCar:{name:"CNG car",icon:"🚘",factor:.13,kind:"car"},
 hybridCar:{name:"Hybrid car",icon:"🔋",factor:.11,kind:"car"},
 electricCar:{name:"Electric car (EV)",icon:"⚡",factor:.07,kind:"car"},
 petrolBike:{name:"Petrol bike",icon:"🏍️",factor:.08,kind:"bike"},
 electricScooter:{name:"Electric scooter",icon:"🛵",factor:.025,kind:"bike"},
 dieselBus:{name:"Diesel bus",icon:"🚌",factor:.06,kind:"public"},
 cngBus:{name:"CNG bus",icon:"🚌",factor:.045,kind:"public"},
 electricBus:{name:"Electric bus",icon:"🔌",factor:.025,kind:"public"},
 train:{name:"Train",icon:"🚆",factor:.035,kind:"public"},
 flight:{name:"Flight",icon:"✈️",factor:.15,kind:"air"}
};
const $=id=>document.getElementById(id);
const fmt=n=>Number.isFinite(n)?n.toFixed(2):"—";
function speedMultiplier(speed,conditions){
 let m=1;
 if(speed<35)m*=1.12; else if(speed>100)m*=1.18; else if(speed>85)m*=1.08;
 if(conditions==="mixed")m*=1.08;
 if(conditions==="heavy")m*=1.22;
 return m;
}
function calc(key,distance,passengers,speed,conditions){
 const o=options[key]; let perKm=o.factor;
 if(o.kind==="car"||o.kind==="bike")perKm*=speedMultiplier(speed,conditions);
 // Vehicle factors for shared transport are already expressed per passenger-km.
 // For private cars/bikes, occupancy reduces the per-person estimate.
 if(o.kind==="car"||o.kind==="bike")return distance*perKm/Math.max(1,passengers);
 return distance*perKm;
}
function getSaved(){try{return JSON.parse(localStorage.getItem("carbonAwareJourney")||"null")}catch(e){return null}}
function save(data){try{localStorage.setItem("carbonAwareJourney",JSON.stringify(data))}catch(e){}}
function renderCalculator(){
 const form=$("tripForm"); if(!form)return;
 form.addEventListener("submit",function(e){
  e.preventDefault();
  const from=$("from").value.trim(),to=$("to").value.trim(),distance=+$("distance").value,passengers=+$("passengers").value,mode=$("mode").value,speed=+$("speed").value,conditions=$("conditions").value;
  if(!from||!to||distance<=0||passengers<1){alert("Please enter valid journey details.");return}
  const estimates=Object.keys(options).map(key=>({key,...options[key],emission:calc(key,distance,passengers,speed,conditions)})).sort((a,b)=>a.emission-b.emission);
  const chosen=estimates.find(x=>x.key===mode),lowest=estimates[0],difference=Math.max(0,chosen.emission-lowest.emission);
  const data={from,to,distance,passengers,mode,modeName:chosen.name,speed,conditions,chosenEmission:chosen.emission,lowestMode:lowest.key,lowestName:lowest.name,lowestEmission:lowest.emission,carbonSaved:difference,estimates};
  save(data); $("results").classList.remove("hidden");$("tripTitle").textContent=from+" → "+to+" · "+distance+" km";$("selectedLabel").textContent="Selected: "+chosen.name;$("chosenEmission").textContent=fmt(chosen.emission);$("lowestEmission").textContent=fmt(lowest.emission);$("lowestName").textContent=lowest.name;$("saving").textContent=fmt(difference);
  $("comparison").innerHTML=estimates.map((x,i)=>`<article class="card result-card"><div class="big-icon">${x.icon}</div><h3>${x.name}</h3><div class="emission">${fmt(x.emission)} kg</div><small>${i===0?"Lowest estimate":(x.key===mode?"Your choice":"Estimated per trip")}</small></article>`).join("");
  const isPrivate=chosen.kind==="car"||chosen.kind==="bike";
  $("driveTips").textContent=isPrivate?`For your ${chosen.name.toLowerCase()}, keep to a safe and legal speed, accelerate smoothly, avoid unnecessary idling, maintain tyre pressure, remove excess load and combine errands. The speed-adjusted figure is a simplified estimate—not a vehicle-specific prediction.`:`You selected ${chosen.name}. For this option, check service availability and occupancy; shared public transport can spread vehicle emissions across passengers.`;
  $("routeTips").textContent=`For ${from} to ${to}, compare a direct practical route with alternatives in a navigation app. Prefer fewer stop-start sections, avoid congestion when possible, and do not take a much longer detour just to chase a small estimated saving. Live road routes and traffic are not fetched by this prototype.`;
  $("results").scrollIntoView({behavior:"smooth",block:"start"});
 });
}
function renderDashboard(){
 const empty=$("dashEmpty"),content=$("dashContent");if(!empty||!content)return;
 const d=getSaved();if(!d)return;empty.classList.add("hidden");content.classList.remove("hidden");
 $("dChosen").textContent=fmt(d.chosenEmission);$("dLowest").textContent=fmt(d.lowestEmission);$("dLowestName").textContent=d.lowestName;$("dSaving").textContent=fmt(d.carbonSaved);
 const max=Math.max(...d.estimates.map(x=>x.emission),.01);
 $("dashBars").innerHTML=d.estimates.map(x=>`<div class="bar-row"><div class="bar-label"><span>${x.icon} ${x.name}</span><span>${fmt(x.emission)} kg CO₂e</span></div><div class="bar-bg"><div class="bar-fill" style="width:${Math.max(2,x.emission/max*100)}%"></div></div></div>`).join("");
}
function renderRecommendations(){
 const empty=$("recEmpty"),content=$("recContent");if(!empty||!content)return;
 const d=getSaved();if(!d)return;empty.classList.add("hidden");content.classList.remove("hidden");
 $("recTitle").textContent=d.lowestName+" has the lowest prototype estimate";
 $("recSummary").textContent=`For ${d.from} to ${d.to} (${d.distance} km), your selected option (${d.modeName}) is estimated at ${fmt(d.chosenEmission)} kg CO₂e. The lowest option in this comparison is ${d.lowestName} at ${fmt(d.lowestEmission)} kg CO₂e. The estimated difference is ${fmt(d.carbonSaved)} kg CO₂e. These are indicative calculations, not verified measurements.`;
 const tips=[];
 if(d.mode==="petrolCar"||d.mode==="dieselCar"||d.mode==="cngCar"||d.mode==="hybridCar"||d.mode==="electricCar"){
  tips.push("If you want to travel by car, compare the available fuel/powertrain options for the same journey.");
  tips.push("Drive smoothly, avoid hard acceleration and unnecessary idling, and maintain correct tyre pressure.");
  tips.push("Choose a safe, legal, practical route and avoid heavy stop-start traffic when possible.");
  if(d.mode==="electricCar")tips.push("For an EV, the estimate depends on electricity generation mix and charging efficiency; this prototype uses one illustrative factor.");
 } else {tips.push("Check whether the lowest-emission option is available and practical for your travel time.");tips.push("If you prefer your selected mode, use the vehicle-specific tips and compare its estimate against alternatives.");}
 tips.push("Try increasing passenger occupancy for a private vehicle only when people are genuinely sharing the same trip.");
 $("recTips").innerHTML=tips.map(t=>`<li>${t}</li>`).join("");
 $("recCaveat").textContent="The emission factors are illustrative placeholders used to demonstrate the calculator. They must be replaced with documented, region-specific factors before making research or real-world accuracy claims. This prototype uses rules, not a trained AI model, and does not yet retrieve live routes, traffic, vehicle efficiency or electricity-grid data.";
}
renderCalculator();renderDashboard();renderRecommendations();
})();