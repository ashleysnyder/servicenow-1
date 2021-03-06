//Author - Antone King. Create incidents when PA thresholds are breached

createIncident();
function createIncident(){
	var json = new JSON();
    var summary = json.decode(event.parm1);
    var scoreDate = summary.scoreDate;
	var reachedThresholdCheck = summary.thresholdCheck;
    var escape = GlideStringUtil.escapeHTML;
    var uuidString = reachedThresholdCheck.uuidString;
	var unit = reachedThresholdCheck.unit;
	
	//split out text from score. This will allow us to compare the score value to a level in order to change the priority of the ticket
	var score = reachedThresholdCheck.matchingScore;
	var newScore = score.split(" ");
            
            if (typeof unit == 'undefined'){
                unit = '';
            }
	
	var condition = reachedThresholdCheck.condition;
            var thresholdLevel = reachedThresholdCheck.thresholdLevel;
            if (typeof thresholdLevel != 'undefined'){
                condition += ' ' + thresholdLevel;
            }
	
	// Set constants for every generated ticket. These values are consistent with every ticket. If you change these values it will affect every ticket
	//that gets inserted.
	var kpi = new GlideRecord('u_kpi');
	kpi.addQuery('u_active', true);
	kpi.addQuery('u_identifier', uuidString); //This matches up to the breached threshold in the system.
	kpi.query();
	

	while(kpi.next()){
		gs.log(">>>> Hits: " + kpi.u_identifier);
		var gr = new GlideRecord('incident');
		gr.initialize();
		gr.assigned_to = kpi.u_assigned;		
		gr.short_description = "Threshold Breached: " + uuidString + " ";
		gr.u_kpi_project = kpi.u_project;
		gr.assignment_group = kpi.u_assignment_group.sys_id;
		gr.priority	= kpi.u_priority;
		
		//This will pull whatever is in the KPI's description field + the details of the breach
		gr.description = uuidString + " was " + condition + " On " + scoreDate + "." + " Current score: " + score + "\r\r" + "Please address ASAP." + "\r\r" + kpi.u_description; 
		
		gr.insert();
		gs.log(">>>> Inserted: " + gr.number);
	}

}


