| Icon | Key | Description |
|------|-----|-------------|
| 🖥️   | Front End | Anything related to UI, React, Next.js, user interactions, or browser logic |
| 💾   | Backend | Node.js, API, database, server logic, authentication, or cloud functions |
| 🧑‍💻 | Person | User-facing features, onboarding, personalization, or account/profile management |
| 🏢   | Business Logic | Features or fixes that pertain to business rules, workflows, or domain-specific logic |
| 🎏   | Stretch Goal | Nice-to-have features, experiments, or tasks that are not critical to the MVP but are valuable |

# https://developers.google.com/maps/documentation/javascript/reference/3d-map

📆 School Quality Score - Ratings of nearby schools and school districts
📆 -AI Appreciation Potential - Projected property value increase over time [No direct free/open source API found; can use historical sales + valuation APIs (e.g., Zillow, RentCast) for price trends]
📆 - RentCastRental Yield - Potential rental income vs. property value
📆 - Fema API Flood Risk - Likelihood of flooding based on FEMA and historical data
📆Noise Level - Proximity to airports, highways, or busy streets [No standard free API; can approximate using proximity to airports/highways via geographic data (OpenStreetMap, others)]
📆[Google Air Quality API] Air Quality - Local pollution and air quality index
📆 -Transit Api- Walkability - Already included, but consider sub-scores for different amenities
📆 -Transit Api- Bike Score - Bike-friendly infrastructure and bike lanes
Development Potential - Zoning and expansion possibilities
📆 - On Market Days on Market - Average time similar properties stay listed
Price per Sq Ft - Compared to neighborhood average
📆 Crime Rate - Already included, but could be broken down by type
Natural Disaster Risk - Earthquakes, wildfires, hurricanes, etc.
📆 - Transit Api- Commute Score - Average commute times to major employment centers
📆 Investment Grade - Overall investment potential rating [Can be derived from aggregated market data (listings, sales velocity) via Zillow, RentCast, RPR APIs]
📆 Neighborhood Demand - How quickly properties sell in the area [Can be derived from aggregated market data (listings, sales velocity) via Zillow, RentCast, RPR APIs]
📆 Property Tax Rate - Compared to surrounding areas [https://www.zillowgroup.com/developers/api/public-data/public-records-api/]
?HOA Quality - If applicable, rating of the homeowners association [https://hoa-usa.com/]
📆 - Transit Api- Walk Score - Already included, but could be enhanced
?Future Development - Planned infrastructure or commercial projects nearby

💾 Dashboard > Property > Lead Activity, add CRUD For Lead Activity for a lead
💾 Dashboard > Property > Add Fetching of on market and on amrket proeprty Data
💾 Dashboard > Property > Add CRUD Lead Functionality   
💾 Dashboard > Property > Add Skip Trace Logic 

# 🖥️ Dashboard > Lead Search > Create Your list > Fix Dropdown usage top use new dropdown in ui usining regular jsx not shad cn && Make the creatye list button false if no list is selected or name is empty
# 🖥️ Dashboard > Kanban  > Add new todo button > Fix dropdown usage top use new dropdown in ui usining regular jsx not shad cn

# 🖥️ Set up user onbaording with https://www.npmjs.com/package/@frigade/react
# 🖥️ Set up user feedback with https://www.npmjs.com/package/@frigade/react

# 🖥️ 🎏 Dashboard > Profile > Ai Context Clone Voice > Create agents | Voice | Campaign Goal | Sales Script | Persona | Background Noise | VoiceMail | 

# 🖥️ Dashboard > Property > Overview Implemtn offmarket cards

# ⁉️ optimize load speeds

# ✅ 🖥️ Login > Implement Demo User Login and site acces restriction

# ✅  🖥️ Dashboard > Map Component >  Edit the map componnet to take in area and pass to fetch data with drawing

#🖥️ ✅ Dashboard > Lead Search > Update Property Card to link to property overview page
# ✅ 🖥️ Dashboard > Lead Search > Implement  save search use to update the current search state


#🖥️ ✅ Dashboard > Lead Search > Update Property Card to link to property overview page

#🖥️ ✅ Dashboard > Lead Search > Property List > Update maps and enable 3D / Street View

# 💾 ✅ Add Check for multiple emails / ips to prevent trial misuse

# 💾 ✅ Add Update activity and assigned on more or member reassign

# 💾 ✅ Enable inviting employees

# ‼ 💾 ✅ Enable employee access based on permissions

# 💾 ✅ Connect Lead search to api

# 💾 ✅ Enable importing user data, into leads , lead data

# 💾 ✅ Connect Skip trace to API , Save skip traced data

# 💾 ✅ Add CRUD functionality Leade Generation | Campaigns | Leads | Lead List Managment | Kanban | Employees

# 💾 ✅ Add upgrade functionality

# 💾 ✅ Integrate fetching campaigns and cron job to update them

# 💾 ✅ Integrate fetching campaigns and cron job to update them High-Risk Fields:


# 🪳 ✅ Fix Selects not able to be updated hydration error components\ui\select.tsx

# 🪳 ✅ Fix dropdowns not able to be for campaing page  components\ui\dropdown-menu.tsx

# 🪳 ✅ When creating a lead list from properties on last page get expected string receved null

# 🖥️ ✅ Implement upload lead list functionality

# 🖥️ ✅ ReImplement profile field validation on type
# 🖥️ ✅ Implment Check Logic on Lead List so users can clcik the proeprties they want to add to the list creeat with(xNum)
 -->

<!-- # 🖥️✅ Fix Kanban creating to do to add priority due date  -->

<!-- # ✅ 🪳 Fix multiple file uploads being able to be deleted profile page  -->

<!-- # 🪳✅ Fix saving profile when editing oveerwriting typing  -->

<!-- # ✅ 💾 Security add update password, enable 2fa -->

<!-- # 💾 ✅ Add webhook for updating kanban state -->

<!-- # 💾 ✅ Set Up Database for nested users, connected with ai usage and skip trace usage, stripe subscriptions -->

<!-- # 💾 ✅ Add activity logging hook/ middleware -->

<!-- # 💾 ✅  Social Planner , Sub Accounts , Email Text, Oauth -->

<!-- # 🪳✅ Fix horizontal scroll on property view being clipped out -->

<!-- #✅ Add layout to speific [] pages -->

<!-- # ✅  Add usage to leads skip traces -->

<!-- #🪳   Fix horizontal scroll on property view -->

<!-- # ✅ optimize mobile display [Lead Search,Campaign Page,Lead Manager,Lead List Manager| Billing Modal] -->

<!-- # ✅ Add video modal explaining each section -->

<!-- # 🪳 ✅ Fix add lead list modal not showing errors or submitting -->

<!-- # 💪✅ Add up sale after sigining up for trial that promprs immediate upgrade | Fix Upgrade modal -->

<!-- # Update variables to be pulled from user profile [✅Credits remaing, ✅Modals (✅Usage , ✅Billing,✅ Security,✅Webhooks, ✅Team Members, ✅Kanban,✅Mock ✅Leads,✅Mock Lead List)] -->

<!-- # 🪳 ✅ Need to fix modals opening and autofocusing, unable to click app behind once closed, Usage one is working fine | Caused  sahd ui dialog

<!-- Uncaught InternalError: too much recursion
    $d3863c46a17e8a28$var$focus index.mjs:247
    handleFocusOut index.mjs:62
    $d3863c46a17e8a28$var$focus index.mjs:250
    handleFocusIn index.mjs:44
    $d3863c46a17e8a28$var$focus index.mjs:247
    handleFocusOut index.mjs:62
index.mjs:247 --> -->

<!-- # 🪳 ✅  Fix Leads Drawer Not laoding when i get to bottom -->

<!-- # 🪳 ✅ Fix Multiple toasts showing when drawer is opened (Maybe multi renders) -->

<!-- # 💪 ✅ Kanban add state -->

<!-- # 💪 ✅ Add New team modal , and employee permissions , invite by email with permissions -->

<!-- # 💪 ✅ Don’t redo skip traces on data you’ve already purchased (List Creation) -->

<!-- # ✅ Add Skip tracing capability -->

<!-- #✅ Create user profile -->

<!-- #✅ Add redirects to page if subscription is over , or user not correctly signed in -->

<!-- #✅ Switch alerts to use sonner https://ui.shadcn.com/docs/components/sonner -->

<!-- #✅ Switch lead results to use shad ui drawer https://ui.shadcn.com/docs/components/drawer -->

<!-- # ✅ Add cancel while drawing -->

<!-- #✅ Add Leads,LeadList to global state , so we can easily switch, filter -->

<!-- #✅ Lead Manager Add pagination , Fix status select -->

<!-- #✅  Add campaigns to global state , so we can easily switch, filter -->

<!-- #✅  Fix Date range picker in campaigns -->

<!-- #✅  add page for user voice , script -->

<!-- #✅ LMNT Voice Cloining [text](https://docs.lmnt.com/api-reference/voice/create-voice#create-voice)

#✅ Look into voice cloning -->

<!-- # Update Location cards to have dark mode ✅ -->
<!-- ⚠️ # Add Data sets for Creatify  Create Video From Link, Get Video Result,Get Vedio History, Generate Preview video from link, Render video [Video]
   # Get existing links, create link, create link with params, update link, get link by id
   # Post Lipsync Task , Get Lipsync items , get lipsync by id
   # Personas , Get available personas, Get all personas by id, create persona, delete persona
   # Voices , Get Voices
   # Get remaining credits -->
<!-- #✅ Fix campaign table types mismatch , maybe need to create different tables for each campaign

# ✅Add Data sets for Vapi Create,Get,List,Update,Delete | Assistant.Create,Get,List,Update,Delete |,Create,Get,List,Update,Delete | Phone Numbers ,Create,Get,List,Update,Delete | Squads, Create,Get,List,Update,Delete | Files, ? Create,Get,List,Update,Delete | Tools, -->

<!-- #✅ Update campaigns to show secondary contact method -->
<!-- # Fix Create lead Filter auto closing when clicking an option
