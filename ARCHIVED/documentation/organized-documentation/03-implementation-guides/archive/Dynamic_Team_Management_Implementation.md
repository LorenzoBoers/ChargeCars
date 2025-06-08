# Dynamic Team Management Implementation Guide

## Overview
ChargeCars V2 implements a flexible team management system where:
- Teams have no fixed regions (can work anywhere)
- Standard teams exist but can be changed daily
- Standard vehicles assigned but swappable daily
- **Absence-focused tracking**: Technicians assumed available unless marked absent
- **Individual skill tracking**: Skills belong to technicians, not teams

## Database Architecture

### Modified Tables

#### contacts (ID: 36) - **ENHANCED FOR TECHNICIAN SKILLS**
**New Technician Fields Added:**
- `technician_skills`: JSON array of individual skills and certifications
- `certification_level`: apprentice, junior_technician, senior_technician, master_technician, team_leader
- `hire_date`: Employee start date for seniority tracking
- `emergency_contact`: Emergency contact information

**Skills Structure Example:**
```json
{
  "certifications": [
    "electrical_safety_level_2",
    "vehicle_charging_installation", 
    "three_phase_electrical",
    "meter_box_replacement",
    "LMRA_certified"
  ],
  "specializations": [
    "wallbox_installation",
    "charging_pole_installation", 
    "electrical_panel_upgrade",
    "smart_charging_configuration"
  ],
  "equipment_authorized": [
    "Alfen_ICU",
    "Zaptec_Pro", 
    "Tesla_Gen3",
    "ABB_Terra"
  ]
}
```

#### installation_teams (ID: 51)
**Changes Made:**
- ❌ Removed: primary_region_id, home_base_location, team_members, current_vehicle_id, **team_skills**, **shift_start_time**, **shift_end_time**
- ✅ Added: team_code, standard_vehicle_id, team_lead_contact_id

**Purpose:** Lightweight team definitions with standard assignments (no fixed hours - partial availability tracked via absence system)

#### team_vehicle_assignments (ID: 59)
**Enhanced for daily flexibility:**
- assignment_date, is_confirmed, status, assignment_notes
- Allows daily vehicle swapping while maintaining standard assignments

### New Tables

#### daily_team_compositions (ID: 65)
**Purpose:** Daily team membership management
**Key Features:**
- Flexible role assignments (team_leader, senior_technician, junior_technician, apprentice)
- Assignment confirmation workflow
- Constraint validation preventing conflicts
- **Skills aggregation**: System automatically aggregates individual technician skills for team capability assessment

#### technician_absence (ID: 66) - **ABSENCE-FOCUSED WITH PARTIAL AVAILABILITY**
**Core Philosophy:** Technicians are available by default, only log when NOT available or partially available

**Key Fields:**
- `absence_date`: Specific day of absence/limited availability
- `absence_type`: vacation, sick_leave, personal_day, training_day, company_event, doctor_appointment, family_emergency, **early_finish**, **late_start**, **lunch_break_extended**, **partial_availability**, other
- `all_day`: Full day absent or partial availability
- `start_time`/`end_time`: Time range unavailable (24h format HH:MM)
- `approval_status`: pending, approved, rejected, cancelled
- **`impacts_route_planning`**: Should this be visible in daily route planning interface
- **`available_for_emergency`**: Can be called for urgent jobs during absence period
- `replacement_needed`: Boolean flag
- `replacement_contact_id`: Who covers the absent technician
- `advance_notice_days`: Planning metric
- `loket_sync_id`/`loket_last_sync`: Future HR system integration

## Business Logic & Constraints

### Automatic Conflict Prevention
1. **No Double Booking**: UNIQUE(assignment_date, technician_contact_id) in daily_team_compositions
2. **One Vehicle Per Day**: UNIQUE(assignment_date, vehicle_id) in team_vehicle_assignments  
3. **One Vehicle Per Team**: UNIQUE(assignment_date, installation_team_id) in team_vehicle_assignments

### Skills-Based Team Assembly
1. **Individual Skills**: Each technician has personal skill profile in contacts.technician_skills
2. **Skill Aggregation**: System calculates team capabilities from assigned members
3. **Job Matching**: Orders matched to teams based on aggregated skills
4. **Skill Gaps**: System identifies missing skills and suggests appropriate technicians

### Absence Management Logic
1. **Default Available**: No record = technician available
2. **Absence Required**: Must log any unavailability
3. **Approval Workflow**: Pending → Approved/Rejected → Active
4. **Replacement Tracking**: System tracks who covers absent technicians

## Operational Workflow

### Daily Operations
1. **Auto-Assignment**: System assigns standard teams + vehicles
2. **Skill Validation**: Check team has required skills for scheduled jobs
3. **Availability Check**: Review partial availability constraints (early finish, late start, etc.)
4. **Route Planning**: System shows time constraints for each technician during day planning
5. **Manager Adjustments**: Modify teams/vehicles for special requirements considering time constraints
6. **Team Confirmation**: Team leaders confirm final compositions with time windows
7. **Go-Live**: Real-time constraint validation active

### Skills-Based Planning
1. **Job Analysis**: System analyzes required skills from order details
2. **Team Capability**: Calculate available skills from assigned technicians
3. **Skill Matching**: Ensure team has all required certifications
4. **Gap Resolution**: If skills missing, suggest qualified replacements
5. **Certification Tracking**: Monitor expiring certifications and training needs

### Absence Management
1. **Request Absence**: Technician submits absence request
2. **Approval Process**: Manager approves/rejects with advance notice tracking
3. **Replacement Planning**: If replacement_needed=true, assign replacement_contact_id
4. **Skill Consideration**: Replacement must have compatible skills for assigned jobs
5. **Team Impact**: System prevents assigning absent technicians to teams
6. **Future Sync**: Prepared for Loket HR system integration

## Examples

### Skills-Based Team Assembly
**Standard Team Alex:**
- **Alex** (team_leader): electrical_safety_level_2, vehicle_charging_installation, LMRA_certified
- **Mark** (senior_technician): three_phase_electrical, meter_box_replacement, Alfen_ICU

**Job Requirement:** Zaptec Pro installation with three-phase connection
**System Action:** 
- Identifies Alex has vehicle_charging_installation ✅
- Identifies Mark has three_phase_electrical ✅
- **Gap**: No Zaptec_Pro equipment authorization ❌
- **Suggestion**: Replace Mark with Tom (has Zaptec_Pro authorization)

### Dynamic Skill-Based Replacement
**Mark absent (sick_leave)**
**Available Replacements:**
- Tom: Zaptec_Pro, wallbox_installation (good match for current jobs)
- Peter: electrical_panel_upgrade, smart_charging (different specialization)

**System Recommendation:** Tom for wallbox jobs, Peter for panel upgrade jobs

### Partial Availability Examples
**Alex - Early Finish:**
- Normal: 08:00-17:00 beschikbaar
- Today: Must leave at 15:00 (family commitment)
- **Absence Record**: absence_type="early_finish", start_time="15:00", impacts_route_planning=true
- **Route Planning**: Alex only available for morning jobs, no afternoon assignments

**Mark - Late Start:**
- Normal: 08:00-17:00 beschikbaar  
- Today: Arrives at 11:00 (doctor appointment)
- **Absence Record**: absence_type="late_start", end_time="11:00", impacts_route_planning=true
- **Route Planning**: Mark available for afternoon jobs only

**Tom - Extended Lunch:**
- Normal: 08:00-17:00 beschikbaar
- Today: Extended lunch 12:00-14:00 (personal business)
- **Absence Record**: absence_type="lunch_break_extended", start_time="12:00", end_time="14:00"
- **Route Planning**: Tom available morning + late afternoon, blocked during lunch window

### Certification Management
**Upcoming Expirations:**
- Alex: electrical_safety_level_2 expires next month
- Tom: LMRA_certification expires in 2 weeks

**System Actions:**
- Schedule recertification training
- Plan backup coverage during training days
- Update absence calendar for training days

## Benefits

### For Management
- **Skill Visibility**: Clear overview of team capabilities and gaps
- **Optimal Assignment**: Match jobs to best-qualified technicians  
- **Training Planning**: Track certification expiries and skill development
- **Quality Assurance**: Ensure qualified technicians for every job type

### For Operations  
- **Intelligent Dispatch**: Automatic skill-based job assignment
- **Flexibility**: Skills stay with individuals during team changes
- **Compliance**: Never send unqualified technicians to specialized jobs
- **Backup Planning**: Smart replacement suggestions based on skills

### For Technicians
- **Career Development**: Clear skill progression pathways
- **Fair Assignment**: Jobs matched to individual capabilities
- **Recognition**: Skills properly attributed to individuals
- **Growth Tracking**: Personal certification and skill history

### For Customers
- **Quality**: Right technician with right skills for every job
- **Reliability**: No delays due to skill mismatches
- **Expertise**: Guaranteed qualified service for specialized installations
- **Consistency**: Skills-based quality standards maintained

## Implementation Status
✅ Database tables created and configured
✅ Business constraints implemented  
✅ Absence-focused logic active
✅ **Skills moved to individual technicians (contacts table)**
✅ **Team skills aggregation logic defined**
🔄 Ready for frontend integration
🔄 Prepared for Loket HR sync 