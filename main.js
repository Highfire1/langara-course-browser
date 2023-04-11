async function fetchdata() {
    const response = await fetch("courseInfo.json");
    const jsonData = await response.json();
    return jsonData
}
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
        <tr>
            <th>Availability:</th>
            <td>${object.availability}</td>
        </tr>
    </table>
    `
    sems = object.prev_offered.join(", ")
    html += `<p>Previously offered : ${sems}.</p>`


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
        </br>
        `
    }
    if (object.transfer.length == 0)
        html += "<p><b>No transfer agreements found.</b></p>"
    else {
        html += `<table><th>Course</th><th>Destination</th><th>Credit</th><th>Start/End</th>`
        for (t of object.transfer) {
            c = ""
            if (t.effective_end != "present") 
                c = "hidden"

            html += `
                <tr class=${c}>
                    <td>${t.subject} ${t.course_code}</td>
                    <td>${t.destination}</td>
                    <td>${t.credit}</td>
                    <td>${t.effective_start} to ${t.effective_end}</td>
                </tr>
            `
        }
        html += `</table>`
    }
    let x = `
    <p>
        Transfers as:
        "subject": "ABST",
        "course_code": 1100,
        "source": "LANG",
        "destination": "CAPU",
        "credit": "CAPU HIST 209 (3)",
        "effective_start": "May/03",
        "effective_end": "present"
    </p>
    `


    let temp = document.createElement('div')
    temp.innerHTML = html
    temp.id = `${object.subject}${object.course_code}`
    temp.className = `courselistcourse`

    return temp
}


document.addEventListener('DOMContentLoaded', async function() {
    data = await fetchdata()
    data = data.courses


    list = this.getElementById("courseTable")

    for (const course in data) {
        list.appendChild(generateHTML(data[course]))
    }

    this.getElementById("searchResults").textContent = `Currently displaying ${data.length} courses.`

})

