async function fetchdata() {
    const response = await fetch("allInfo.json");
    const jsonData = await response.json();
    return jsonData
}


document.addEventListener('DOMContentLoaded', async function() {

    if (this.getElementById("courseTable").hasChildNodes()) {
        return
    }

    data = await fetchdata()
    data = data.courses

    //data = data.slice(0, 5)


    list = this.getElementById("courseTable")

    for (const course in data) {
        list.appendChild(generateHTML(data[course]))
    }

    this.getElementById("searchResults").textContent = `Currently displaying ${data.length} courses.`

})









function generateHTML(object) {

    html = ""

    hours = ""
    if (object.hours != null)
        hours = `{${object.hours.lecture}:${object.hours.seminar}:${object.hours.lab}}`

    desc = ""
    if (object.description != null)
        desc = `<p>${object.description}</p>`

    fee = ""
    if (object.add_fees != null)
        fee = object.add_fees.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    rpt = ""
    if (object.rpt_limit != null)
        rpt = object.rpt_limit
    
    let avail_color = "green"
    if (object.availability == "discontinued") 
        avail_color = "red"
    if (object.availability == "unknown")
        avail_color = "yellow"

    html += `
    <h3>${object.subject} ${object.course_code} ${object.title} ${hours}</h3>
    ${desc}

    <table>
        <tr>
            <th>Credits:</th>
            <td>${object.credits}</td>
        </tr>
        <tr>
            <th>Fees:</th>
            <td>${fee}</td>
        </tr>
        <tr>
            <th>Repeat Limit:</th> 
            <td>${rpt}</td>
        </tr>
        <tr class=${avail_color}>
            <th>Availability:</th>
            <td>${object.availability}</td>
        </tr>
    </table>
    `

    if (object.attributes === null)
        html += "<p><b>No course attributes available.</b></p>"
    else {
        html += `
        <table>
            <tr> <th>AR</th> <th>SC</th> <th>HUM</th> <th>LSC</th> <th>SCI</th> <th>SOC</th> <th>UT</th> </tr>
            <tr>
                <td>${object.attributes["AR"]}</td>
                <td>${object.attributes["SC"]}</td>
                <td>${object.attributes["HUM"]}</td>
                <td>${object.attributes["LSC"]}</td>
                <td>${object.attributes["SCI"]}</td>
                <td>${object.attributes["SOC"]}</td>
                <td>${object.attributes["UT"]}</td>
        </table>
        `
    }

    if (object.transfer.length == 0)
        html += "<p><b>No transfer agreements found.</b></p>"
    else {
        html += `<table class="transferTable"> 
        <th>Course</th><th>Destination</th><th>Credit</th><th>Start/End</th>
        `

        for (t of object.transfer) {

            classes = ""
            if (t.effective_end != "present") 
                classes += "hidden "

            if (t.credit == "No credit")
                classes += "red "
            
            //if (t.credit != undefined)
            //    console.log(t.credit.split("(").at(-1).split(")").at(0))

            // yellow on ind assessment or if you only get partial credits for transfer
            if (t.credit == "Individual assessment." || (t.credit != undefined && parseFloat(t.credit.split("(").at(-1).split(")").at(0)) < parseFloat(object.credits)))
                classes += "yellow "
            
            html += `
                <tr class=${classes} ${t.destination}>
                    <td class="tablePriority">${t.subject} ${t.course_code}</td>
                    <td class="tablePriority">${t.destination}</td>
                    <td>${t.credit}</td>
                    <td class="tablePriority">${t.effective_start} to ${t.effective_end}</td>
                </tr>
            `
        }
        html += `</table>`
    }

    sems = object.prev_offered.join(", ")
    html += `<p>Previously offered : ${sems}.</p>`

    html += `
    <table class="offeredTable"> 
    <thead><th>Semester</th> <th>Seats</th> <th>Waitlist</th> <th>Days</th> <th>Time</th> <th>Room</th> <th>Type</th> <th>Instructor</th></thead>
    `

    for (c of object.offered) {
        html += `<tbody>`
        let s = []
        for (sch of c.schedule) {
            s.push(`
            <td class=mono>${sch.days}</td> 
            <td class=mono>${sch.time}</td> 
            <td class=mono>${sch.room}</td> 
            <td class=mono>${sch.instructor}</td>  
            <td class=mono>${sch.type}</td> `
            )
        }

        html += `<tr>
            <td rowspan="${s.length}">${c.yearsemester}</td>
            <td rowspan="${s.length}">${c.seats}</td>
            <td rowspan="${s.length}">${c.waitlist}</td>            
            ${s[0]}
            </tr>
        `        
        for (string of s.slice(1)) {
            html += `<tr>${string}</tr>`
        }
        html += `</tbody>`
    }

    html += `</table>`
    


    let temp = document.createElement('div')
    temp.innerHTML = html
    temp.id = `${object.subject}${object.course_code}`
    temp.className = `courselistcourse`

    return temp
}