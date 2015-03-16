define(["libs/underscore","viz/trackster/util","mvc/data","libs/lunr"],function(y,a,z,s){var g={hidden:false,show:function(){this.set("hidden",false)},hide:function(){this.set("hidden",true)},toggle:function(){this.set("hidden",!this.get("hidden"))},is_visible:function(){return !this.attributes.hidden}};var e=Backbone.Model.extend({defaults:{name:null,label:null,type:null,value:null,html:null,num_samples:5},initialize:function(A){this.attributes.html=unescape(this.attributes.html)},copy:function(){return new e(this.toJSON())},set_value:function(A){this.set("value",A||"")}});var i=Backbone.Collection.extend({model:e});var k=e.extend({});var d=e.extend({set_value:function(A){this.set("value",parseInt(A,10))},get_samples:function(){return d3.scale.linear().domain([this.get("min"),this.get("max")]).ticks(this.get("num_samples"))}});var f=d.extend({set_value:function(A){this.set("value",parseFloat(A))}});var u=e.extend({get_samples:function(){return y.map(this.get("options"),function(A){return A[0]})}});e.subModelTypes={integer:d,"float":f,data:k,select:u};var j=Backbone.Model.extend({defaults:{id:null,name:null,description:null,target:null,inputs:[],outputs:[]},urlRoot:galaxy_config.root+"api/tools",initialize:function(A){this.set("inputs",new i(y.map(A.inputs,function(B){var C=e.subModelTypes[B.type]||e;return new C(B)})))},toJSON:function(){var A=Backbone.Model.prototype.toJSON.call(this);A.inputs=this.get("inputs").map(function(B){return B.toJSON()});return A},remove_inputs:function(B){var A=this,C=A.get("inputs").filter(function(D){return(B.indexOf(D.get("type"))!==-1)});A.get("inputs").remove(C)},copy:function(B){var C=new j(this.toJSON());if(B){var A=new Backbone.Collection();C.get("inputs").each(function(D){if(D.get_samples()){A.push(D)}});C.set("inputs",A)}return C},apply_search_results:function(A){(y.indexOf(A,this.attributes.id)!==-1?this.show():this.hide());return this.is_visible()},set_input_value:function(A,B){this.get("inputs").find(function(C){return C.get("name")===A}).set("value",B)},set_input_values:function(B){var A=this;y.each(y.keys(B),function(C){A.set_input_value(C,B[C])})},run:function(){return this._run()},rerun:function(B,A){return this._run({action:"rerun",target_dataset_id:B.id,regions:A})},get_inputs_dict:function(){var A={};this.get("inputs").each(function(B){A[B.get("name")]=B.get("value")});return A},_run:function(C){var D=y.extend({tool_id:this.id,inputs:this.get_inputs_dict()},C);var B=$.Deferred(),A=new a.ServerStateDeferred({ajax_settings:{url:this.urlRoot,data:JSON.stringify(D),dataType:"json",contentType:"application/json",type:"POST"},interval:2000,success_fn:function(E){return E!=="pending"}});$.when(A.go()).then(function(E){B.resolve(new z.DatasetCollection().reset(E))});return B}});y.extend(j.prototype,g);var q=Backbone.View.extend({});var n=Backbone.Collection.extend({model:j});var w=Backbone.Model.extend(g);var l=Backbone.Model.extend({defaults:{elems:[],open:false},clear_search_results:function(){y.each(this.attributes.elems,function(A){A.show()});this.show();this.set("open",false)},apply_search_results:function(B){var C=true,A;y.each(this.attributes.elems,function(D){if(D instanceof w){A=D;A.hide()}else{if(D instanceof j){if(D.apply_search_results(B)){C=false;if(A){A.show()}}}}});if(C){this.hide()}else{this.show();this.set("open",true)}}});y.extend(l.prototype,g);var c=Backbone.Model.extend({defaults:{search_hint_string:"search tools",min_chars_for_search:3,spinner_url:"",clear_btn_url:"",search_url:"",visible:true,query:"",results:null,clear_key:27},urlRoot:galaxy_config.root+"api/tools",initialize:function(){this.on("change:query",this.do_search)},do_search:function(){var C=this.attributes.query;if(C.length<this.attributes.min_chars_for_search){this.set("results",null);return}var B=C;if(this.timer){clearTimeout(this.timer)}$("#search-clear-btn").hide();$("#search-spinner").show();var A=this;this.timer=setTimeout(function(){if(typeof ga!=="undefined"){ga("send","pageview",galaxy_config.root+"?q="+B)}$.get(A.urlRoot,{q:B},function(D){A.set("results",D);$("#search-spinner").hide();$("#search-clear-btn").show()},"json")},400)},clear_search:function(){this.set("query","");this.set("results",null)}});y.extend(c.prototype,g);var o=Backbone.Model.extend({initialize:function(A){this.attributes.tool_search=A.tool_search;this.attributes.tool_search.on("change:results",this.apply_search_results,this);this.attributes.tools=A.tools;this.attributes.layout=new Backbone.Collection(this.parse(A.layout))},parse:function(B){var A=this,C=function(F){var E=F.model_class;if(E.indexOf("Tool")===E.length-4){return A.attributes.tools.get(F.id)}else{if(E==="ToolSection"){var D=y.map(F.elems,C);F.elems=D;return new l(F)}else{if(E==="ToolSectionLabel"){return new w(F)}}}};return y.map(B,C)},clear_search_results:function(){this.get("layout").each(function(A){if(A instanceof l){A.clear_search_results()}else{A.show()}})},apply_search_results:function(){var B=this.get("tool_search").get("results");if(B===null){this.clear_search_results();return}var A=null;this.get("layout").each(function(C){if(C instanceof w){A=C;A.hide()}else{if(C instanceof j){if(C.apply_search_results(B)){if(A){A.show()}}}else{A=null;C.apply_search_results(B)}}})}});var t=Backbone.View.extend({initialize:function(){this.model.on("change:hidden",this.update_visible,this);this.update_visible()},update_visible:function(){(this.model.attributes.hidden?this.$el.hide():this.$el.show())}});var m=t.extend({tagName:"div",render:function(){var A=$("<div/>");A.append(Handlebars.templates.tool_link(this.model.toJSON()));if(this.model.id==="upload1"){A.find("a").on("click",function(B){B.preventDefault();Galaxy.upload.show()})}this.$el.append(A);return this}});var b=t.extend({tagName:"div",className:"toolPanelLabel",render:function(){this.$el.append($("<span/>").text(this.model.attributes.text));return this}});var r=t.extend({tagName:"div",className:"toolSectionWrapper",initialize:function(){t.prototype.initialize.call(this);this.model.on("change:open",this.update_open,this)},render:function(){this.$el.append(Handlebars.templates.panel_section(this.model.toJSON()));var A=this.$el.find(".toolSectionBody");y.each(this.model.attributes.elems,function(B){if(B instanceof j){var C=new m({model:B,className:"toolTitle"});C.render();A.append(C.$el)}else{if(B instanceof w){var D=new b({model:B});D.render();A.append(D.$el)}else{}}});return this},events:{"click .toolSectionTitle > a":"toggle"},toggle:function(){this.model.set("open",!this.model.attributes.open)},update_open:function(){(this.model.attributes.open?this.$el.children(".toolSectionBody").slideDown("fast"):this.$el.children(".toolSectionBody").slideUp("fast"))}});var p=Backbone.View.extend({tagName:"div",id:"tool-search",className:"bar",events:{click:"focus_and_select","keyup :input":"query_changed","click #search-clear-btn":"clear"},render:function(){this.$el.append(Handlebars.templates.tool_search(this.model.toJSON()));if(!this.model.is_visible()){this.$el.hide()}this.$el.find("[title]").tooltip();return this},focus_and_select:function(){this.$el.find(":input").focus().select()},clear:function(){this.model.clear_search();this.$el.find(":input").val(this.model.attributes.search_hint_string);this.focus_and_select();return false},query_changed:function(A){if((this.model.attributes.clear_key)&&(this.model.attributes.clear_key===A.which)){this.clear();return false}this.model.set("query",this.$el.find(":input").val())}});var x=Backbone.View.extend({tagName:"div",className:"toolMenu",initialize:function(){this.model.get("tool_search").on("change:results",this.handle_search_results,this)},render:function(){var A=this;var B=new p({model:this.model.get("tool_search")});B.render();A.$el.append(B.$el);this.model.get("layout").each(function(D){if(D instanceof l){var C=new r({model:D});C.render();A.$el.append(C.$el)}else{if(D instanceof j){var E=new m({model:D,className:"toolTitleNoSection"});E.render();A.$el.append(E.$el)}else{if(D instanceof w){var F=new b({model:D});F.render();A.$el.append(F.$el)}}}});A.$el.find("a.tool-link").click(function(E){var D=$(this).attr("class").split(/\s+/)[0],C=A.model.get("tools").get(D);A.trigger("tool_link_click",E,C)});return this},handle_search_results:function(){var A=this.model.get("tool_search").get("results");if(A&&A.length===0){$("#search-no-results").show()}else{$("#search-no-results").hide()}}});var v=Backbone.View.extend({className:"toolForm",render:function(){this.$el.children().remove();this.$el.append(Handlebars.templates.tool_form(this.model.toJSON()))}});var h=Backbone.View.extend({className:"toolMenuAndView",initialize:function(){this.tool_panel_view=new x({collection:this.collection});this.tool_form_view=new v()},render:function(){this.tool_panel_view.render();this.tool_panel_view.$el.css("float","left");this.$el.append(this.tool_panel_view.$el);this.tool_form_view.$el.hide();this.$el.append(this.tool_form_view.$el);var A=this;this.tool_panel_view.on("tool_link_click",function(C,B){C.preventDefault();A.show_tool(B)})},show_tool:function(B){var A=this;B.fetch().done(function(){A.tool_form_view.model=B;A.tool_form_view.render();A.tool_form_view.$el.show();$("#left").width("650px")})}});return{ToolParameter:e,IntegerToolParameter:d,SelectToolParameter:u,Tool:j,ToolCollection:n,ToolSearch:c,ToolPanel:o,ToolPanelView:x,ToolFormView:v}});