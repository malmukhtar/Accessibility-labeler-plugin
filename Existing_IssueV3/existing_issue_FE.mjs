function init(){
    predict();
}

var span_check = 0;

/*SEND ISSUE DATA TO NODE.JS BACK-END AND RECEIVE PREDICTION THEN REFORMAT AND DISPLAY*/
function predict(){
    AP.context.getContext(function(response){
        var issue_key = response.jira.issue.key;
        
        AP.request("/rest/api/3/issue/" + issue_key)
        .then(data => {
            return data.body;
        })
        .then(body => {
            var parsed_body = JSON.parse(body);
            var issue_type = parsed_body.fields.issuetype.name;
            var desc = parsed_body.fields.description.content[0].content[0].text;
            var title = parsed_body.fields.summary;

            let issue_data = JSON.stringify({
                "issue_type": issue_type,
                "desc": desc,
                "title": title
            });
    
            let fetch_url = "https://accessibility-labeler-plugin.onrender.com/predict";
            let settings = { method: "POST", body: issue_data, mode: "cors",
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json',"Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT"} };

            fetch(fetch_url, settings).then(res => res.json()).then((json) => {
                var result = JSON.stringify(json);
                var prediction = JSON.parse(result);
                var label = prediction.label;
                var confidence = prediction.confidence;
                var accessibility = prediction.accessibility;
                var naccessibility = prediction.naccessibility;
                var issue_type = prediction.current_issue_type;
    
                var correct_type = "";
                var type_check = 0;
                if(accessibility>naccessibility){
                    correct_type = "Accessibility";
                }
                else{
                    correct_type="Non-accessibility";
                }
    
                var a0 = accessibility*100;
                var a1 = a0.toFixed(2);
                var a2 = a1.toString();
                var n0 = naccessibility*100;
                var n1 = n0.toFixed(2);
                var n2 = n1.toString();
    
                
                // if(issue_type!=label){
                //     document.getElementById("icon").src = "https://accessibility-labeler-plugin.onrender.com/warning";
                //     if(span_check==1){
                //         document.getElementById("right").remove();
                //         span_check = 0;
                //     }
                //     if(span_check==0){
                //         document.getElementById("icon-span").innerHTML += "<span id='wrong'>The current issue type (<b>"+issue_type+"</b>) does not match the predicted issue type (<b>"+correct_type+"</b>)!</span>";
                //         span_check = -1;
                //     }
                // }
                // else{
                //     type_check = 1;
                //     document.getElementById("icon").src = "https://accessibility-labeler-plugin.onrender.com/correct";
                //     if(span_check==-1){
                //         document.getElementById("wrong").remove();
                //         span_check = 0;
                //     }
                //     if(span_check==0){
                //         document.getElementById("icon-span").innerHTML += "<span id='right'>The current issue type matches the predicted issue type!</span>";
                //         span_check=1;
                //     }
                // }
    
                var res_tab = document.getElementById("result");
                res_tab.innerHTML = "";
    
                if(accessibility>naccessibility){
                    res_tab.innerHTML += "<tr><th class='correct1'>Accessibility </th><th><span class='ratings' title='Confidence: "+a2+"%'>"+a2+" %</span></th></tr>";
                    res_tab.innerHTML += "<tr><td class='other'>Non-accessibility </td><td><span class='ratings' title='Confidence: "+n2+"%'>"+n2+" %</span></th></tr>";
                }else{
                    res_tab.innerHTML += "<tr><th class='correct1'>Non-accessibility </th><th><span class='ratings' title='Confidence: "+n2+"%'>"+n2+" %</span></th></tr>";
                    res_tab.innerHTML += "<tr><td class='other'>Accessibility </td><td><span class='ratings' title='Confidence: "+a2+"%'>"+a2+" %</span></th></tr>";
                        
                }
    
    
                if(type_check==0){
                    document.getElementsByTagName("th")[0].style.backgroundColor = "rgb(247, 179, 179)";
                    document.getElementsByTagName("th")[1].style.backgroundColor = "rgb(247, 179, 179)";
                }
    
                var dummyText = "";
                return dummyText;
            })
            .then((dummyText) => {
                console.log("DONE");
                predict();
            })
            .catch(error => {
                console.log("PREDICT ERROR: "+error);
            })
        })
        .catch(e => console.log("GET ISSUE ERROR: "+e));
    })
}