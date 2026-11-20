/* ParkCare - frontend demonstration using LocalStorage.
   Note: LocalStorage is browser/device-specific. Use a backend for shared production data. */
// Storage key used to save reports in this browser.
const STORAGE_KEY = "parkcare_tracker_v1";
const PARKS = [
{
    id:"park-rose",name:"Rose Garden Park",address:"Garden Avenue, Sector 16",emoji:"🌷",description:"Flower beds, walking paths and quiet seating areas.",facilities:["Walking paths","Garden","Benches"]
},
{
    id:"park-central",name:"City Central Park",address:"Central Boulevard, Sector 22",emoji:"🌳",description:"A lively green space with lawns and family recreation.",facilities:["Open lawns","Playground","Lighting"]
},
{
    id:"park-green",name:"Green Valley Park",address:"Valley Road, Sector 35",emoji:"🌲",description:"A peaceful neighbourhood park with shaded trails.",facilities:["Shaded trails","Dustbins","Water points"]
},
{
    id:"park-lake",name:"Lakeside Community Park",address:"Lake View Road, Sector 42",emoji:"🌊",description:"A community gathering spot with a scenic walking loop.",facilities:["Walking loop","Seating","Landscaping"]
},
{
    id:"park-sunrise",name:"Sunrise Children's Park",address:"Sunrise Lane, Sector 8",emoji:"🛝",description:"A family-friendly space with play equipment and open grass.",facilities:["Play equipment","Family area","Open grass"]
},
{
    id:"park-meadow",name:"Meadow Recreation Park",address:"Meadow Street, Sector 50",emoji:"🌿",description:"Wide lawns and recreation space for local residents.",facilities:["Open lawns","Sports area","Pathways"]
}];
// Options used in report forms and filters.
const CATEGORIES = ["Broken bench or equipment","Waste and litter","Lighting","Pathway damage","Water or irrigation","Landscaping","Public toilet","Other"];
const STATUSES = ["Submitted","Assigned","In Progress","Resolved","Reopened"];
const WORKERS = ["Unassigned","Aarav Sharma","Priya Singh","Mohit Verma","Neha Patel","Maintenance Team A"];
let state = loadState();
let toastTimer;
let currentDialogIssue = null;
// Load saved reports. If none exist, use the sample reports below.
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved) {
            const parsed = JSON.parse(saved);
            if(parsed && Array.isArray(parsed.issues)) return parsed;
        }
    }
    catch(error) {
        console.warn("Could not load saved ParkCare data.", error);
    }
    return {
        issues: seedIssues()
    };
}
// Save the current app data to LocalStorage.
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    catch(error) {
        showToast("Storage is full. Try using a smaller image or remove old reports.");
        console.error(error);
    }
}
// Sample reports shown the first time the website is opened.
function seedIssues() {
    const now = Date.now();
    return [
    {
        id:"PK-1001",parkId:"park-rose",category:"Broken bench or equipment",title:"Broken bench near main path",description:"One of the wooden benches has a loose seat plank and needs repair.",location:"Near the main walking path",priority:"High",status:"In Progress",reporter:"Ananya",email:"",createdAt:new Date(now-86400000*2).toISOString(),assignee:"Aarav Sharma",resolutionNotes:"Replacement plank requested.",reportPhoto:"",evidencePhoto:"",feedback:null,updatedAt:new Date(now-3600000).toISOString()
    },
    {
        id:"PK-1002",parkId:"park-central",category:"Lighting",title:"Pathway light not working",description:"The light beside the north entrance does not turn on after sunset.",location:"North entrance",priority:"Medium",status:"Submitted",reporter:"Local resident",email:"",createdAt:new Date(now-86400000).toISOString(),assignee:"Unassigned",resolutionNotes:"",reportPhoto:"",evidencePhoto:"",feedback:null,updatedAt:new Date(now-86400000).toISOString()
    },
    {
        id:"PK-1003",parkId:"park-green",category:"Waste and litter",title:"Dustbin overflowing",description:"The bin near the play area is full and litter is gathering nearby.",location:"Children's play area",priority:"Urgent",status:"Assigned",reporter:"Rohan",email:"",createdAt:new Date(now-86400000*3).toISOString(),assignee:"Priya Singh",resolutionNotes:"",reportPhoto:"",evidencePhoto:"",feedback:null,updatedAt:new Date(now-7200000).toISOString()
    },
    {
        id:"PK-1004",parkId:"park-lake",category:"Landscaping",title:"Dry plants along the lake path",description:"Several plants look dry and the soil needs watering.",location:"East side of walking loop",priority:"Low",status:"Resolved",reporter:"Meera",email:"",createdAt:new Date(now-86400000*5).toISOString(),assignee:"Mohit Verma",resolutionNotes:"Plants watered and irrigation line checked.",reportPhoto:"",evidencePhoto:"",feedback: {
            rating:5,comment:"The team took care of this quickly. Thank you!",name:"Meera",createdAt:new Date(now-86400000).toISOString()
        },
        updatedAt:new Date(now-86400000).toISOString()
    }];
}
// Small helper functions used throughout the website.
const $ = (id) => document.getElementById(id);
const esc = (value="") => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const parkById = id => PARKS.find(p => p.id === id) || {name:"Unknown park",address:"",emoji:"🌳",facilities:[]};
const openIssues = () => state.issues.filter(i => i.status !== "Resolved");
const resolvedIssues = () => state.issues.filter(i => i.status === "Resolved");
const fmtDate = value => { if(!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}); };
const shortDate = value => { if(!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined,{day:"numeric",month:"short"}); };
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const statusClass = status => `status-${slug(status)}`;
const priorityClass = priority => `priority-${slug(priority)}`;
const statusPill = status => `<span class="status-pill ${statusClass(status)}">${esc(status)}</span>`;
const priorityPill = priority => `<span class="priority-pill ${priorityClass(priority)}">${esc(priority)}</span>`;
const feedbackItems = () => state.issues.filter(i => i.feedback && i.feedback.rating);
const averageRating = () => { const items=feedbackItems(); return items.length ? (items.reduce((s,i)=>s+Number(i.feedback.rating),0)/items.length).toFixed(1) : "—"; };
// Display a short message at the bottom of the page.
function showToast(message){
  const toast=$("toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),3200);
}
// Switch between website pages and refresh the displayed data.
function go(view){
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===`view-${view}`));
  document.querySelectorAll(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  const active=document.querySelector(`.nav-link[data-view="${view}"]`);
  $("breadcrumbCurrent").textContent=active ? active.textContent.trim().replace(/^\S+\s/,"") : view;
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  renderAll();
}
function issueRow(issue){
  const park=parkById(issue.parkId);
  return `<tr><td><div class="issue-title-cell">${esc(issue.title)}</div><div class="sub-cell">${esc(issue.id)} · ${shortDate(issue.createdAt)}</div></td><td>${esc(park.name)}</td><td>${priorityPill(issue.priority)}</td><td>${statusPill(issue.status)}</td></tr>`;
}
// Update the dashboard numbers and analytics summaries.
function renderStats(){
  const total=state.issues.length, pending=state.issues.filter(i=>["Submitted","Assigned","Reopened"].includes(i.status)).length, progress=state.issues.filter(i=>i.status==="In Progress").length, resolved=resolvedIssues().length;
  const rate=total ? Math.round(resolved/total*100) : 0;
  $("statTotal").textContent=total; $("statPending").textContent=pending; $("statProgress").textContent=progress; $("statResolved").textContent=resolved;
  $("resolutionRate").textContent=`${rate}%`; $("navIssueCount").textContent=openIssues().length;
  $("avgRating").textContent=averageRating(); $("feedbackCount").textContent=feedbackItems().length;
  $("analyticsResolution").textContent=`${rate}%`;
  $("analyticsHigh").textContent=state.issues.filter(i=>["High","Urgent"].includes(i.priority)&&i.status!=="Resolved").length;
  $("analyticsRating").textContent=averageRating(); $("analyticsParks").textContent=PARKS.length;
}
// Draw a simple horizontal bar chart using HTML.
function renderBars(containerId, entries){
  const el=$(containerId); if(!el)return;
  const max=Math.max(1,...entries.map(e=>e.count));
  if(!entries.length || entries.every(e=>e.count===0)){el.innerHTML='<div class="empty-state"><div class="empty-icon">🌱</div><strong>No reports yet</strong><p>New issue reports will appear here.</p></div>';return;}
  el.innerHTML=entries.map(e=>`<div class="bar-row"><span title="${esc(e.label)}">${esc(e.label.length>22?e.label.slice(0,20)+"…":e.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(e.count?4:0,e.count/max*100)}
%"></div></div><span class="bar-count">${e.count}</span></div>`).join("");
}
function categoryCounts(){
  return CATEGORIES.map(label=>({label,count:state.issues.filter(i=>i.category===label).length})).filter(e=>e.count>0).sort((a,b)=>b.count-a.count);
}
// Render the dashboard sections.
function renderDashboard(){
  $("recentIssues").innerHTML=state.issues.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(issueRow).join("") || '<tr><td colspan="4">No reports yet. Submit the first report.</td></tr>';
  const cats=categoryCounts(); renderBars("categoryChart",cats); $("categoryTotal").textContent=`${state.issues.length} reports`;
  $("dashboardParks").innerHTML=PARKS.slice(0,3).map(parkCard).join("");
}
function parkCard(park){
  const issues=state.issues.filter(i=>i.parkId===park.id), open=issues.filter(i=>i.status!=="Resolved").length;
  return `<article class="park-card"><div class="park-visual"><span class="park-badge">${open?`${open} open issue${open===1?"":"s"}`:"Well maintained"}</span><span class="park-emoji">${park.emoji}</span></div><div class="park-body"><h3>${esc(park.name)}</h3><div class="park-address">⌖ ${esc(park.address)}</div><div class="park-meta"><span>${issues.length} report${issues.length===1?"":"s"}</span><strong>${park.facilities.length} facilities</strong></div><div class="park-card-actions"><button class="btn btn-secondary" data-park-issues="${park.id}">View issues</button><button class="btn btn-primary" data-report-park="${park.id}">Report</button></div></div></article>`;
}
// Display parks and apply the search/filter options.
function renderParks(){
  const q=($("parkSearch").value||"").trim().toLowerCase(), filter=$("parkFilter").value;
  const parks=PARKS.filter(p=>(p.name+" "+p.address+" "+p.facilities.join(" ")).toLowerCase().includes(q)&&(filter!=="issues"||state.issues.some(i=>i.parkId===p.id&&i.status!=="Resolved")));
  $("parksGrid").innerHTML=parks.map(parkCard).join("") || '<div class="empty-state"><div class="empty-icon">🌳</div><strong>No parks found</strong><p>Try a different search or filter.</p></div>';
}
// Display reports and apply search/status/priority filters.
function renderIssues(){
  const q=($("issueSearch").value||"").trim().toLowerCase(), sf=$("statusFilter").value, pf=$("priorityFilter").value;
  const issues=state.issues.filter(i=>{
    const park=parkById(i.parkId);
    return (i.id+" "+i.title+" "+i.description+" "+park.name+" "+i.category).toLowerCase().includes(q)&&(sf==="all"||i.status===sf)&&(pf==="all"||i.priority===pf);
  }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $("issuesList").innerHTML=issues.map(i=>{
    const p=parkById(i.parkId);
    return `<article class="issue-card"><div class="issue-main"><div class="issue-id">${esc(i.id)} · REPORTED ${fmtDate(i.createdAt)}</div><h3>${esc(i.title)}</h3><p class="issue-description">${esc(i.description)}</p><div class="issue-meta"><span>♧ ${esc(p.name)}</span><span>⌖ ${esc(i.location)}</span><span>⚒ ${esc(i.assignee||"Unassigned")}</span></div><div class="issue-meta">${priorityPill(i.priority)} ${statusPill(i.status)} ${i.reportPhoto?'<span>📷 Photo attached</span>':""} ${i.evidencePhoto?'<span>✓ Evidence attached</span>':""}</div></div><div class="issue-actions"><button class="btn btn-secondary" data-view-issue="${i.id}">View / manage →</button>${i.status==="Resolved"&&!i.feedback?`<button class="btn btn-primary" data-feedback-issue="${i.id}">Leave feedback</button>`:""}</div></article>`;
  }).join("") || '<div class="empty-state"><div class="empty-icon">🔎</div><strong>No matching issues</strong><p>Try changing your search or filters, or submit a new report.</p><br><button class="btn btn-primary" data-go="report">＋ Report an issue</button></div>';
}
// Display ratings and comments left by residents.
function renderFeedback(){
  const items=feedbackItems().sort((a,b)=>new Date(b.feedback.createdAt)-new Date(a.feedback.createdAt));
  $("feedbackList").innerHTML=items.map(i=>`<article class="feedback-card"><div class="feedback-stars">${"★".repeat(Number(i.feedback.rating))}${"☆".repeat(5-Number(i.feedback.rating))}</div><h3>${esc(i.title)}</h3><div class="sub-cell">${esc(parkById(i.parkId).name)} · ${esc(i.id)}</div><p class="feedback-comment">${esc(i.feedback.comment||"No written comment provided.")}</p><div class="feedback-byline">By ${esc(i.feedback.name||i.reporter||"Resident")} · ${fmtDate(i.feedback.createdAt)}</div></article>`).join("") || '<div class="empty-state"><div class="empty-icon">☆</div><strong>No feedback yet</strong><p>When residents rate resolved issues, their feedback will appear here.</p></div>';
}
// Calculate and display report statistics by park and category.
function renderAnalytics(){
  renderBars("statusChart",STATUSES.map(label=>({label,count:state.issues.filter(i=>i.status===label).length})));
  renderBars("analyticsCategoryChart",categoryCounts());
  $("parkPerformance").innerHTML=PARKS.map(p=>{
    const list=state.issues.filter(i=>i.parkId===p.id), resolved=list.filter(i=>i.status==="Resolved").length, open=list.length-resolved, rate=list.length?Math.round(resolved/list.length*100):0;
    return `<tr><td class="issue-title-cell">${esc(p.name)}</td><td>${list.length}</td><td>${open}</td><td>${resolved}</td><td><strong>${rate}%</strong></td></tr>`;
  }).join("");
}
function renderReportParkOptions(selected=""){
  $("reportPark").innerHTML='<option value="">Choose a park</option>'+PARKS.map(p=>`<option value="${p.id}" ${p.id===selected?"selected":""}>${esc(p.name)}</option>`).join("");
}
function renderAll(){
  renderStats(); renderDashboard(); renderParks(); renderIssues(); renderFeedback(); renderAnalytics();
}
// Read an image file so it can be previewed and saved with a report.
function readFileAsDataURL(file,maxBytes=1.5*1024*1024){
  return new Promise((resolve,reject)=>{
    if(!file){resolve("");return;}
    if(!file.type.startsWith("image/")){reject(new Error("Please choose an image file."));return;}
    if(file.size>maxBytes){reject(new Error("Image must be 1.5 MB or smaller to fit browser storage."));return;}
    const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(new Error("Could not read the selected image.")); reader.readAsDataURL(file);
  });
}
// Create the next report ID (for example, PK-1005).
function nextIssueId(){
  const nums=state.issues.map(i=>Number(String(i.id).replace(/\D/g,""))||0);
  return `PK-${String(Math.max(1000,...nums)+1)}`;
}
// Show a preview when a resident selects a report photo.
$("reportPhoto").addEventListener("change",async e=>{
  const file=e.target.files[0], preview=$("reportPhotoPreview");
  try{const data=await readFileAsDataURL(file);if(data){preview.src=data;preview.classList.remove("hidden")}else{preview.removeAttribute("src");preview.classList.add("hidden")}}
  catch(err){e.target.value="";preview.classList.add("hidden");showToast(err.message)}
});
// Validate and save a new maintenance report.
$("reportForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const submit=e.submitter; if(submit){submit.disabled=true;submit.textContent="Submitting…";}
  try{
    const photo=await readFileAsDataURL($("reportPhoto").files[0]);
    const issue={
      id:nextIssueId(),parkId:$("reportPark").value,category:$("reportCategory").value,title:$("reportTitle").value.trim(),
      description:$("reportDescription").value.trim(),location:$("reportLocation").value.trim(),priority:$("reportPriority").value,
      status:"Submitted",reporter:$("reporterName").value.trim(),email:$("reporterEmail").value.trim(),
      createdAt:new Date().toISOString(),assignee:"Unassigned",resolutionNotes:"",reportPhoto:photo,evidencePhoto:"",feedback:null,updatedAt:new Date().toISOString()
    };
    if(!issue.parkId||!issue.category||!issue.title||!issue.description||!issue.location){showToast("Please complete all required fields.");return;}
    state.issues.unshift(issue);saveState();e.target.reset();$("reportPhotoPreview").classList.add("hidden");renderAll();go("issues");showToast(`Report ${issue.id} submitted successfully.`);
  }catch(err){showToast(err.message||"Could not submit report.");}
  finally{if(submit){submit.disabled=false;submit.textContent="Submit report →";}}
});
// Open the report details window and management controls.
function openIssueDialog(issueId,feedbackOnly=false){
  const issue=state.issues.find(i=>i.id===issueId); if(!issue)return;
  currentDialogIssue=issueId;
  const p=parkById(issue.parkId), dialog=$("issueDialog");
  const feedbackBlock=issue.status==="Resolved" ? (issue.feedback
    ? `<div class="inline-feedback"><h4>Resident feedback · ${"★".repeat(Number(issue.feedback.rating))}</h4><p>${esc(issue.feedback.comment||"No written comment.")}</p><span class="small-note">By ${esc(issue.feedback.name||"Resident")}</span></div>`
    : `<div class="dialog-section"><h3>Resident feedback</h3><div class="dialog-fields"><label>Rating (1–5 stars)<select id="feedbackRating"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select></label><label>Your name<input id="feedbackName" maxlength="80" placeholder="Optional"></label><label class="full">Comment<textarea id="feedbackComment" rows="2" maxlength="600" placeholder="Share your experience..."></textarea></label></div><div class="dialog-buttons"><button class="btn btn-primary" data-save-feedback="${issue.id}">Save feedback</button></div></div>`)
    : "";
  $("issueDialogContent").innerHTML=`
    <div class="dialog-head"><div><div class="issue-id">${esc(issue.id)} · ${esc(p.name)}</div><h2>${esc(issue.title)}</h2><div>${statusPill(issue.status)} ${priorityPill(issue.priority)}</div></div><button class="dialog-close" data-close-dialog aria-label="Close">×</button></div>
    <div class="dialog-content">
      <div class="dialog-section"><h3>Report details</h3><p class="issue-description">${esc(issue.description)}</p><div class="issue-meta"><span>⌖ ${esc(issue.location)}</span><span>Reported ${fmtDate(issue.createdAt)}</span><span>By ${esc(issue.reporter||"Resident")}</span></div>${issue.reportPhoto?`<p class="small-note">Original report photo</p><img class="evidence-image" src="${issue.reportPhoto}" alt="Original report evidence">`:""}</div>
      <div class="dialog-section"><h3>Assignment and status</h3><div class="dialog-fields"><label>Assigned worker<select id="editAssignee">${WORKERS.map(w=>`<option ${w===(issue.assignee||"Unassigned")?"selected":""}>${esc(w)}</option>`).join("")}</select></label><label>Issue status<select id="editStatus">${STATUSES.map(s=>`<option ${s===issue.status?"selected":""}>${esc(s)}</option>`).join("")}</select></label><label>Priority<select id="editPriority">${["Low","Medium","High","Urgent"].map(s=>`<option ${s===issue.priority?"selected":""}>${s}</option>`).join("")}</select></label><label class="full">Resolution notes<textarea id="editResolution" rows="3" maxlength="1000" placeholder="What work was done or is planned?">${esc(issue.resolutionNotes||"")}</textarea></label><label class="full">Resolution evidence photo <span class="small-note">(optional, max 1.5 MB)</span><input id="editEvidence" type="file" accept="image/*"></label></div>${issue.evidencePhoto?`<p class="small-note">Current resolution evidence</p><img class="evidence-image" src="${issue.evidencePhoto}" alt="Resolution evidence">`:""}<div class="dialog-buttons"><button class="btn btn-primary" data-save-issue="${issue.id}">Save changes</button></div></div>
      ${feedbackBlock}
      <div class="small-note">Demo note: changes are stored in this browser only. Do not enter sensitive personal information.</div>
    </div>`;
  if(!dialog.open)dialog.showModal();
  if(feedbackOnly){setTimeout(()=>{const rating=$("feedbackRating");if(rating)rating.focus()},50)}
}
// Save changes to assignment, priority, status, and resolution evidence.
async function saveIssue(issueId){
  const issue=state.issues.find(i=>i.id===issueId); if(!issue)return;
  try{
    const evidence=await readFileAsDataURL($("editEvidence").files[0]);
    const status=$("editStatus").value, assignee=$("editAssignee").value;
    if(status==="Assigned"&&assignee==="Unassigned"){showToast("Choose a worker before setting status to Assigned.");return;}
    if(status==="Resolved"&&!($("editResolution").value.trim()||issue.resolutionNotes)){showToast("Add resolution notes before marking this issue resolved.");return;}
    issue.assignee=assignee;issue.status=status;issue.priority=$("editPriority").value;issue.resolutionNotes=$("editResolution").value.trim();
    if(evidence)issue.evidencePhoto=evidence;
    issue.updatedAt=new Date().toISOString();
    saveState();renderAll();openIssueDialog(issueId);showToast(`Report ${issueId} updated.`);
  }catch(err){showToast(err.message||"Could not save changes.");}
}
// Save a resident rating and comment for a resolved report.
function saveFeedback(issueId){
  const issue=state.issues.find(i=>i.id===issueId);if(!issue||issue.status!=="Resolved")return;
  issue.feedback={rating:Number($("feedbackRating").value),name:$("feedbackName").value.trim(),comment:$("feedbackComment").value.trim(),createdAt:new Date().toISOString()};
  issue.updatedAt=new Date().toISOString();saveState();renderAll();openIssueDialog(issueId);showToast("Thank you for your feedback!");
}
// Download all reports as a CSV spreadsheet.
function exportCSV(){
  const headers=["ID","Park","Category","Title","Description","Location","Priority","Status","Assigned Worker","Reporter","Created At","Updated At","Resolution Notes","Rating","Feedback"];
  const rows=state.issues.map(i=>[i.id,parkById(i.parkId).name,i.category,i.title,i.description,i.location,i.priority,i.status,i.assignee,i.reporter,i.createdAt,i.updatedAt,i.resolutionNotes,i.feedback?.rating||"",i.feedback?.comment||""]);
  const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}), url=URL.createObjectURL(blob), a=document.createElement("a");
  a.href=url;a.download="parkcare-maintenance-reports.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast("CSV report exported.");
}
// Handle buttons created dynamically inside the page.
document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]");if(nav){go(nav.dataset.view);return;}
  const goBtn=e.target.closest("[data-go]");if(goBtn){go(goBtn.dataset.go);return;}
  const viewIssue=e.target.closest("[data-view-issue]");if(viewIssue){openIssueDialog(viewIssue.dataset.viewIssue);return;}
  const feedbackIssue=e.target.closest("[data-feedback-issue]");if(feedbackIssue){openIssueDialog(feedbackIssue.dataset.feedbackIssue,true);return;}
  const reportPark=e.target.closest("[data-report-park]");if(reportPark){renderReportParkOptions(reportPark.dataset.reportPark);go("report");return;}
  const parkIssues=e.target.closest("[data-park-issues]");if(parkIssues){const p=parkById(parkIssues.dataset.parkIssues);$("issueSearch").value=p.name;$("statusFilter").value="all";$("priorityFilter").value="all";go("issues");return;}
  const close=e.target.closest("[data-close-dialog]");if(close){$("issueDialog").close();return;}
  const save=e.target.closest("[data-save-issue]");if(save){saveIssue(save.dataset.saveIssue);return;}
  const feedback=e.target.closest("[data-save-feedback]");if(feedback){saveFeedback(feedback.dataset.saveFeedback);return;}
});
$("parkSearch").addEventListener("input",renderParks);$("parkFilter").addEventListener("change",renderParks);
$("issueSearch").addEventListener("input",renderIssues);$("statusFilter").addEventListener("change",renderIssues);$("priorityFilter").addEventListener("change",renderIssues);
$("exportBtn").addEventListener("click",exportCSV);
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("issueDialog").addEventListener("click",e=>{if(e.target===$("issueDialog"))$("issueDialog").close()});
$("issueDialog").addEventListener("close",()=>{currentDialogIssue=null});
$("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
// Prepare the form and render the initial page data.
renderReportParkOptions();renderAll();
