import xml.etree.ElementTree as ET
import xml.dom.minidom
import os

def main():
    print("Generating Draw.io XML structure with Swimlanes...")
    
    # Initialize mxfile
    mxfile = ET.Element("mxfile", host="Electron", modified="2026-05-20T07:18:00.000Z", agent="Mozilla/5.0", version="20.0.0", type="device")
    
    # Helper to create a page (diagram tab)
    def create_page(mxfile, page_id, name):
        diagram = ET.SubElement(mxfile, "diagram", id=page_id, name=name)
        mxGraphModel = ET.SubElement(diagram, "mxGraphModel", dx="1422", dy="762", grid="1", gridSize="10", guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1", pageScale="1", pageWidth="850", pageHeight="1100")
        root = ET.SubElement(mxGraphModel, "root")
        ET.SubElement(root, "mxCell", id="0")
        ET.SubElement(root, "mxCell", id="1", parent="0")
        return root

    # Element creation helpers
    def add_swimlane(root, cell_id, name, x, y, width, height):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=name, style="swimlane;html=1;startSize=30;horizontal=1;collapsible=0;recursiveResize=0;fillColor=#f9f9f9;strokeColor=#cccccc;fontStyle=1;align=center;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(width), height=str(height))
        geom.set("as", "geometry")
        return cell

    def add_actor(root, cell_id, name, x, y):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=name, style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width="40", height="80")
        geom.set("as", "geometry")
        return cell

    def add_usecase(root, cell_id, name, x, y, width=200, height=60):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=name, style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;align=center;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(width), height=str(height))
        geom.set("as", "geometry")
        return cell

    def add_system_boundary(root, cell_id, name, x, y, width, height):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=name, style="swimlane;html=1;startSize=20;horizontal=1;container=1;collapsible=0;recursiveResize=0;fillColor=#f5f5f5;strokeColor=#666666;fontStyle=1;align=center;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(width), height=str(height))
        geom.set("as", "geometry")
        return cell

    def add_association(root, cell_id, source_id, target_id):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value="", style="endArrow=none;html=1;rounded=0;endSize=8;", edge="1", parent="1", source=source_id, target=target_id)
        geom = ET.SubElement(cell, "mxGeometry", relative="1")
        geom.set("as", "geometry")
        return cell

    def add_generalization(root, cell_id, child_id, parent_id):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value="", style="endArrow=block;endSize=16;endFill=0;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;", edge="1", parent="1", source=child_id, target=parent_id)
        geom = ET.SubElement(cell, "mxGeometry", relative="1")
        geom.set("as", "geometry")
        return cell

    # Activity helpers
    def add_start(root, cell_id, x, y):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value="", style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;strokeColor=none;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width="20", height="20")
        geom.set("as", "geometry")
        return cell

    def add_end(root, cell_id, x, y):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value="", style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width="20", height="20")
        geom.set("as", "geometry")
        return cell

    def add_action(root, cell_id, name, x, y, width=120, height=50):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=name, style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;arcSize=10;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(width), height=str(height))
        geom.set("as", "geometry")
        return cell

    def add_decision(root, cell_id, name, x, y, width=80, height=80):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=name, style="rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;align=center;", vertex="1", parent="1")
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(width), height=str(height))
        geom.set("as", "geometry")
        return cell

    def add_flow(root, cell_id, source_id, target_id, value=""):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=value, style="endArrow=block;html=1;rounded=0;endFill=1;endSize=8;", edge="1", parent="1", source=source_id, target=target_id)
        geom = ET.SubElement(cell, "mxGeometry", relative="1")
        geom.set("as", "geometry")
        return cell


    # ================= PAGE 1: Use Case Level 0 =================
    root1 = create_page(mxfile, "page_uc_lvl0", "Use Case Level 0 (System Context)")
    add_system_boundary(root1, "sys_b_0", "Lokali Platform", 240, 80, 400, 540)
    
    # Actors
    add_actor(root1, "act_v0", "Visitor", 60, 130)
    add_actor(root1, "act_m0", "Member", 60, 260)
    add_actor(root1, "act_o0", "Business Owner", 60, 390)
    add_actor(root1, "act_a0", "Admin", 700, 260)
    add_actor(root1, "act_s0", "System Scheduler", 700, 480)
    
    # Generalizations
    add_generalization(root1, "gen_m_v0", "act_m0", "act_v0")
    add_generalization(root1, "gen_o_m0", "act_o0", "act_m0")
    
    # Use cases
    add_usecase(root1, "uc_search_mod", "Search & Discovery Module<br/>(UC-01, UC-02, UC-03, UC-16)", 340, 140)
    add_usecase(root1, "uc_contrib_mod", "Community Contributions<br/>(UC-04, UC-05, UC-06, UC-10..15)", 340, 230)
    add_usecase(root1, "uc_biz_mod", "Business Profile & Management<br/>(UC-07, UC-08, UC-17)", 340, 320)
    add_usecase(root1, "uc_mod_mod", "Moderation & System Admin<br/>(UC-09, UC-18, UC-19..21)", 340, 410)
    add_usecase(root1, "uc_agg_mod", "Data Aggregation Scheduler<br/>(UC-22)", 340, 500)
    
    # Associations
    add_association(root1, "asc_v_s", "act_v0", "uc_search_mod")
    add_association(root1, "asc_m_c", "act_m0", "uc_contrib_mod")
    add_association(root1, "asc_o_b", "act_o0", "uc_biz_mod")
    add_association(root1, "asc_a_m", "act_a0", "uc_mod_mod")
    add_association(root1, "asc_s_a", "act_s0", "uc_agg_mod")


    # ================= PAGE 2: Use Case Level 1 (Visitor & Member) =================
    root2 = create_page(mxfile, "page_uc_lvl1_vm", "Use Case Level 1 (Visitor & Member)")
    add_system_boundary(root2, "sys_b_1_vm", "Lokali - Discovery & Community Module", 240, 40, 460, 1080)
    
    add_actor(root2, "act_v1", "Visitor", 60, 180)
    add_actor(root2, "act_m1", "Member", 60, 620)
    add_generalization(root2, "gen_m_v1", "act_m1", "act_v1")
    
    ucs_vm = [
        ("uc_01", "UC-01: Search for Spots", 80),
        ("uc_02", "UC-02: Filter Content", 160),
        ("uc_03", "UC-03: AI Vibe Check", 240),
        ("uc_16", "UC-16: Explore Trending", 320),
        ("uc_04", "UC-04: Add New Spot", 410),
        ("uc_05", "UC-05: Write Review", 490),
        ("uc_06", "UC-06: Geolocation Check-in", 570),
        ("uc_10", "UC-10: Report Content", 650),
        ("uc_11", "UC-11: Manage Profile", 730),
        ("uc_12", "UC-12: View Activity History", 810),
        ("uc_13", "UC-13: View Leaderboard", 890),
        ("uc_14", "UC-14: Save Favorites", 970),
        ("uc_15", "UC-15: Edit/Delete Content", 1050)
    ]
    
    for uid, name, y in ucs_vm:
        add_usecase(root2, uid, name, 320, y)
        
    # Connections
    add_association(root2, "c_v_01", "act_v1", "uc_01")
    add_association(root2, "c_v_02", "act_v1", "uc_02")
    add_association(root2, "c_v_03", "act_v1", "uc_03")
    add_association(root2, "c_v_16", "act_v1", "uc_16")
    
    add_association(root2, "c_m_04", "act_m1", "uc_04")
    add_association(root2, "c_m_05", "act_m1", "uc_05")
    add_association(root2, "c_m_06", "act_m1", "uc_06")
    add_association(root2, "c_m_10", "act_m1", "uc_10")
    add_association(root2, "c_m_11", "act_m1", "uc_11")
    add_association(root2, "c_m_12", "act_m1", "uc_12")
    add_association(root2, "c_m_13", "act_m1", "uc_13")
    add_association(root2, "c_m_14", "act_m1", "uc_14")
    add_association(root2, "c_m_15", "act_m1", "uc_15")


    # ================= PAGE 3: Use Case Level 1 (Owner & Admin & System) =================
    root3 = create_page(mxfile, "page_uc_lvl1_oas", "Use Case Level 1 (Owner & Admin & System)")
    add_system_boundary(root3, "sys_b_1_oas", "Lokali - Admin & Business Module", 240, 40, 460, 820)
    
    add_actor(root3, "act_o1", "Business Owner", 60, 200)
    add_actor(root3, "act_a1", "Admin", 740, 380)
    add_actor(root3, "act_s1", "System", 740, 680)
    
    ucs_oas = [
        ("uc_07", "UC-07: Claim Spot", 80),
        ("uc_08", "UC-08: Manage Official Content", 160),
        ("uc_17", "UC-17: View Business Analytics", 240),
        ("uc_09", "UC-09: Content Moderation", 340),
        ("uc_18", "UC-18: Verify Business Claim", 430),
        ("uc_19", "UC-19: AI Control Panel", 520),
        ("uc_20", "UC-20: Platform Monitoring", 610),
        ("uc_21", "UC-21: Search Insights", 700),
        ("uc_22", "UC-22: Snapshot Statistik Harian", 780)
    ]
    
    for uid, name, y in ucs_oas:
        add_usecase(root3, uid, name, 320, y)
        
    # Connections
    add_association(root3, "c_o_07", "act_o1", "uc_07")
    add_association(root3, "c_o_08", "act_o1", "uc_08")
    add_association(root3, "c_o_17", "act_o1", "uc_17")
    
    add_association(root3, "c_a_09", "act_a1", "uc_09")
    add_association(root3, "c_a_18", "act_a1", "uc_18")
    add_association(root3, "c_a_19", "act_a1", "uc_19")
    add_association(root3, "c_a_20", "act_a1", "uc_20")
    add_association(root3, "c_a_21", "act_a1", "uc_21")
    
    add_association(root3, "c_s_22", "act_s1", "uc_22")


    # ================= PAGE 4: Activity Diagram - Check-in Geolocation (UC-06) =================
    root4 = create_page(mxfile, "page_act_checkin", "Activity - Check-in Geolocation (UC-06)")
    
    # Visual Swimlanes (Added first to render in the background)
    add_swimlane(root4, "swim_m4", "Member", 80, 40, 220, 830)
    add_swimlane(root4, "swim_s4", "System (Frontend/API)", 300, 40, 220, 830)
    add_swimlane(root4, "swim_d4", "Database (Firestore)", 520, 40, 220, 830)
    
    # Workflow Nodes
    add_start(root4, "c4_start", 180, 80)
    add_action(root4, "c4_a1", "Member clicks Check-in<br/>on Spot Detail page", 130, 130, 120, 50)
    add_action(root4, "c4_a2", "Fetch current GPS coordinates<br/>from browser/device", 340, 190, 140, 50)
    add_decision(root4, "c4_d1", "GPS Permission<br/>Granted?", 370, 260)
    
    # Error branch 1
    add_action(root4, "c4_err1", "Show GPS Error Alert", 130, 275, 120, 50)
    add_end(root4, "c4_end1", 180, 345)
    
    # Distance Check
    add_decision(root4, "c4_d2", "Within 100 meters<br/>radius?", 370, 380)
    add_action(root4, "c4_err2", "Show Out-of-Range Message", 125, 395, 130, 50)
    add_end(root4, "c4_end2", 180, 465)
    
    # Cooldown Check
    add_decision(root4, "c4_d3", "Cooldown active?<br/>(18 hours / spot)", 370, 500)
    add_action(root4, "c4_err3", "Show Cooldown Alert", 130, 515, 120, 50)
    add_end(root4, "c4_end3", 180, 585)
    
    # Write Check-in & XP
    add_action(root4, "c4_a3", "Write checkin document to<br/>Firestore & award 20 XP", 550, 630, 160, 55)
    add_action(root4, "c4_a4", "Refresh UI, update state<br/>& show badge animation", 130, 710, 150, 55)
    add_end(root4, "c4_end_success", 180, 795)
    
    # Flows
    add_flow(root4, "f4_1", "c4_start", "c4_a1")
    add_flow(root4, "f4_2", "c4_a1", "c4_a2")
    add_flow(root4, "f4_3", "c4_a2", "c4_d1")
    add_flow(root4, "f4_4", "c4_d1", "c4_err1", "No")
    add_flow(root4, "f4_5", "c4_err1", "c4_end1")
    add_flow(root4, "f4_6", "c4_d1", "c4_d2", "Yes")
    add_flow(root4, "f4_7", "c4_d2", "c4_err2", "No")
    add_flow(root4, "f4_8", "c4_err2", "c4_end2")
    add_flow(root4, "f4_9", "c4_d2", "c4_d3", "Yes")
    add_flow(root4, "f4_10", "c4_d3", "c4_err3", "Yes")
    add_flow(root4, "f4_11", "c4_err3", "c4_end3")
    add_flow(root4, "f4_12", "c4_d3", "c4_a3", "No")
    add_flow(root4, "f4_13", "c4_a3", "c4_a4")
    add_flow(root4, "f4_14", "c4_a4", "c4_end_success")


    # ================= PAGE 5: Activity Diagram - AI Vibe Check Auto-Summarizer (UC-03 / UC-19) =================
    root5 = create_page(mxfile, "page_act_ai_summary", "Activity - AI Vibe Check Auto-Summarizer (UC-03 / UC-19)")
    
    # Visual Swimlanes (Added first)
    add_swimlane(root5, "swim_u5", "Admin / User", 80, 40, 220, 970)
    add_swimlane(root5, "swim_s5", "System (Core Engine)", 300, 40, 220, 970)
    add_swimlane(root5, "swim_g5", "Gemini AI Service", 520, 40, 200, 970)
    add_swimlane(root5, "swim_d5", "Database (Firestore)", 720, 40, 200, 970)
    
    # Workflow Nodes
    add_start(root5, "c5_start", 180, 80)
    add_action(root5, "c5_a1", "Trigger: New review posted (UC-05)<br/>or Admin manual sync (UC-19)", 110, 130, 160, 55)
    add_action(root5, "c5_a2", "Query Firestore reviews on target spot<br/>from the last 6 months", 330, 200, 160, 55)
    add_decision(root5, "c5_d1", "Total Reviews<br/>>= 3?", 370, 270)
    
    # Failure condition (insufficient data)
    add_action(root5, "c5_err1", "Do nothing (Maintain empty/<br/>existing AI Vibe state)", 340, 360, 150, 55)
    add_end(root5, "c5_end1", 390, 435)
    
    # Process reviews
    add_action(root5, "c5_a3", "Compile review texts &<br/>system instructions prompt", 330, 470, 160, 55)
    add_action(root5, "c5_a4", "Call Gemini AI Pro API", 340, 550, 140, 50)
    add_action(root5, "c5_a_gemini", "Process reviews & generate<br/>Pros, Cons, and Verdict", 540, 550, 160, 50)
    add_decision(root5, "c5_d2", "API Success?", 370, 630)
    
    # API Failure
    add_action(root5, "c5_err2", "Log API error & Alert Admin", 340, 710, 150, 55)
    add_end(root5, "c5_end2", 390, 785)
    
    # Parsing and Updating
    add_action(root5, "c5_a5", "Parse response JSON<br/>(Pros, Cons, Verdict)", 335, 820, 150, 50)
    add_action(root5, "c5_a6", "Update spot document in Firestore<br/>(vibeCheck & timestamp)", 740, 820, 160, 55)
    add_action(root5, "c5_a7", "Trigger Frontend ISR cache validation<br/>to display new vibe summary", 320, 890, 180, 55)
    add_end(root5, "c5_end_success", 180, 905)
    
    # Flows
    add_flow(root5, "f5_1", "c5_start", "c5_a1")
    add_flow(root5, "f5_2", "c5_a1", "c5_a2")
    add_flow(root5, "f5_3", "c5_a2", "c5_d1")
    add_flow(root5, "f5_4", "c5_d1", "c5_err1", "No")
    add_flow(root5, "f5_5", "c5_err1", "c5_end1")
    add_flow(root5, "f5_6", "c5_d1", "c5_a3", "Yes")
    add_flow(root5, "f5_7", "c5_a3", "c5_a4")
    add_flow(root5, "f5_8", "c5_a4", "c5_a_gemini")
    add_flow(root5, "f5_9", "c5_a_gemini", "c5_d2")
    add_flow(root5, "f5_10", "c5_d2", "c5_err2", "No")
    add_flow(root5, "f5_11", "c5_err2", "c5_end2")
    add_flow(root5, "f5_12", "c5_d2", "c5_a5", "Yes")
    add_flow(root5, "f5_13", "c5_a5", "c5_a6")
    add_flow(root5, "f5_14", "c5_a6", "c5_a7")
    add_flow(root5, "f5_15", "c5_a7", "c5_end_success")


    # ================= PAGE 6: Activity Diagram - Claim Verification (UC-07 / UC-18) =================
    root6 = create_page(mxfile, "page_act_claim", "Activity - Claim Verification (UC-07 / UC-18)")
    
    # Visual Swimlanes (Added first)
    add_swimlane(root6, "swim_m6", "Member (Owner Candidate)", 80, 40, 220, 880)
    add_swimlane(root6, "swim_a6", "Administrator", 300, 40, 220, 880)
    add_swimlane(root6, "swim_s6", "System & Database", 520, 40, 240, 880)
    
    # Workflow Nodes
    add_start(root6, "c6_start", 180, 80)
    add_action(root6, "c6_a1", "Member submits Claim request<br/>with legal proof documents (UC-07)", 110, 130, 160, 55)
    add_action(root6, "c6_a2", "Create claim document in Firestore<br/>with status = 'pending'", 560, 130, 160, 55)
    add_action(root6, "c6_a3", "Admin views pending claim requests<br/>in Admin Dashboard", 330, 210, 160, 55)
    add_action(root6, "c6_a4", "Admin cross-checks uploaded proof<br/>vs spot business details (UC-18)", 330, 290, 160, 55)
    add_decision(root6, "c6_d1", "Claim proof<br/>valid?", 370, 370)
    
    # Failure path
    add_action(root6, "c6_err1", "Update Claim status = 'rejected'<br/>& save Admin rejection reason", 560, 370, 160, 55)
    add_action(root6, "c6_err2", "Send failure notification to user", 570, 450, 140, 50)
    add_end(root6, "c6_end_fail", 180, 465)
    
    # Success path
    add_action(root6, "c6_a5", "Update Claim status = 'approved'<br/>& assign ownerId to Spot document", 560, 530, 160, 60)
    add_action(root6, "c6_a6", "Update User role = 'owner'<br/>in users collection", 560, 610, 150, 55)
    add_action(root6, "c6_a7", "Send success claim verification<br/>notification to user", 560, 695, 160, 55)
    add_end(root6, "c6_end_success", 180, 710)
    
    # Flows
    add_flow(root6, "f6_1", "c6_start", "c6_a1")
    add_flow(root6, "f6_2", "c6_a1", "c6_a2")
    add_flow(root6, "f6_3", "c6_a2", "c6_a3")
    add_flow(root6, "f6_4", "c6_a3", "c6_a4")
    add_flow(root6, "f6_5", "c6_a4", "c6_d1")
    add_flow(root6, "f6_6", "c6_d1", "c6_err1", "No")
    add_flow(root6, "f6_7", "c6_err1", "c6_err2")
    add_flow(root6, "f6_8", "c6_err2", "c6_end_fail")
    add_flow(root6, "f6_9", "c6_d1", "c6_a5", "Yes")
    add_flow(root6, "f6_10", "c6_a5", "c6_a6")
    add_flow(root6, "f6_11", "c6_a6", "c6_a7")
    add_flow(root6, "f6_12", "c6_a7", "c6_end_success")


    # Write XML content out
    print("Formatting and writing Draw.io XML to file...")
    xml_str = ET.tostring(mxfile, encoding="utf-8")
    
    # Pretty-print
    dom = xml.dom.minidom.parseString(xml_str)
    pretty_xml_str = dom.toprettyxml(indent="  ")
    
    # Save file to docs/diagrams/use_cases_and_activities.drawio
    output_dir = "docs/diagrams"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    output_path = os.path.join(output_dir, "use_cases_and_activities.drawio")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(pretty_xml_str)
        
    print(f"Successfully generated Draw.io file with Swimlanes: {output_path}")

if __name__ == "__main__":
    main()
