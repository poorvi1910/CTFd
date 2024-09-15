import{m as o,C as i,M as r,c as d}from"./index.7e48942e.js";import{s as n,c as m}from"./clipboard.1749e720.js";import{g as c}from"./userscore.1d4e199f.js";import{e as u}from"./index.955e6486.js";import"./echarts.128204f2.js";window.Alpine=o;window.CTFd=i;o.store("inviteToken","");o.data("TeamEditModal",()=>({success:null,error:null,initial:null,errors:[],init(){this.initial=n(this.$el.querySelector("form"))},async updateProfile(){let e=n(this.$el,this.initial,!0);e.fields=[];for(const a in e)if(a.match(/fields\[\d+\]/)){let s={},l=parseInt(a.slice(7,-1));s.field_id=l,s.value=e[a],e.fields.push(s),delete e[a]}let t=await i.pages.teams.updateTeamSettings(e);t.success?(this.success=!0,this.error=!1,setTimeout(()=>{this.success=null,this.error=null},3e3)):(this.success=!1,this.error=!0,Object.keys(t.errors).map(a=>{const s=t.errors[a];this.errors.push(s)}))}}));o.data("TeamCaptainModal",()=>({success:null,error:null,errors:[],async updateCaptain(){let e=n(this.$el,null,!0),t=await i.pages.teams.updateTeamSettings(e);t.success?window.location.reload():(this.success=!1,this.error=!0,Object.keys(t.errors).map(a=>{const s=t.errors[a];this.errors.push(s)}))}}));o.data("TeamInviteModal",()=>({copy(){m(this.$refs.link)}}));o.data("TeamDisbandModal",()=>({errors:[],async disbandTeam(){let e=await i.pages.teams.disbandTeam();e.success?window.location.reload():this.errors=e.errors[""]}}));o.data("CaptainMenu",()=>({captain:!1,editTeam(){this.teamEditModal=new r(document.getElementById("team-edit-modal")),this.teamEditModal.show()},chooseCaptain(){this.teamCaptainModal=new r(document.getElementById("team-captain-modal")),this.teamCaptainModal.show()},async inviteMembers(){const e=await i.pages.teams.getInviteToken();if(e.success){const t=e.data.code,a=`${window.location.origin}${i.config.urlRoot}/teams/invite?code=${t}`;document.querySelector("#team-invite-modal input[name=link]").value=a,this.$store.inviteToken=a,this.teamInviteModal=new r(document.getElementById("team-invite-modal")),this.teamInviteModal.show()}else Object.keys(e.errors).map(t=>{const a=e.errors[t];alert(a)})},disbandTeam(){this.teamDisbandModal=new r(document.getElementById("team-disband-modal")),this.teamDisbandModal.show()}}));o.data("TeamGraphs",()=>({solves:null,fails:null,awards:null,solveCount:0,failCount:0,awardCount:0,getSolvePercentage(){return(this.solveCount/(this.solveCount+this.failCount)*100).toFixed(2)},getFailPercentage(){return(this.failCount/(this.solveCount+this.failCount)*100).toFixed(2)},getCategoryBreakdown(){const e=[],t={};this.solves.data.map(s=>{e.push(s.challenge.category)}),e.forEach(s=>{s in t?t[s]+=1:t[s]=1});const a=[];for(const s in t)a.push({name:s,count:t[s],percent:t[s]/e.length*100,color:d(s)});return a},async init(){this.solves=await i.pages.teams.teamSolves("me"),this.fails=await i.pages.teams.teamFails("me"),this.awards=await i.pages.teams.teamAwards("me"),this.solveCount=this.solves.meta.count,this.failCount=this.fails.meta.count,this.awardCount=this.awards.meta.count;let e=window.teamScoreGraphChartOptions;u(this.$refs.scoregraph,c(i.team.id,i.team.name,this.solves.data,this.awards.data,e))}}));o.start();
