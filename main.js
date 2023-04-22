async function fetchdata() {
    const response = await fetch("allInfo.json");
    const jsonData = await response.json();
    return jsonData
}

var courses = null
var currentPage = 1 // starts at 1
var coursesPerPage = null

document.addEventListener('DOMContentLoaded', async function() {

    if (this.getElementById("courseTable").hasChildNodes()) {
        return
    }

    for(const paginator of document.getElementsByClassName("paginator")) {
        const b1 = document.createElement("button")
        b1.textContent = "Previous"
        //b1.disabled = true

        const text = document.createElement("p")
        text.textContent = "Loading courses..."

        const b2 = document.createElement("button")
        b2.textContent = "Next"

        paginator.appendChild(b1)
        paginator.appendChild(text)
        paginator.appendChild(b2)

        // previous page
        b1.addEventListener("click", function() {
            currentPage = Math.max(1, currentPage-1)
            updateCourseTable()
            window.scrollTo({top: 0, behavior: 'smooth'});
        })

        // next page
        b2.addEventListener("click", function() {
            currentPage = Math.min(currentPage+1, Math.ceil(courses.length / document.getElementById("coursesPerPageCount").value))
            updateCourseTable()
            window.scrollTo({top: 0, behavior: 'smooth'});
        })
    }

    
    courses = await fetchdata()
    courses = courses.courses
    //courses = courses.slice(0, 100)

    coursesPerPage = parseInt(document.getElementById("coursesPerPageCount").value)
    document.getElementById("coursesPerPageCount").addEventListener("change", function() {
        // translate page (ie 20 items/page & currentPage 10 -> 100 items/page & currentPage 2)
        const count = coursesPerPage * (currentPage-1)
        coursesPerPage = parseInt(document.getElementById("coursesPerPageCount").value)
        currentPage = Math.floor(count / coursesPerPage) + 1

        updateCourseTable()
    })

    updateCourseTable()

    document.getElementById("transferCheckbox").addEventListener("click", function(event) {
        document.getElementsByClassName("transferTable").style += " hidden"
    })

})

function updateCourseTable() {
    if (courses == null) 
        return

    

    const courseNodes = document.createDocumentFragment()
    const offset = (currentPage-1)*coursesPerPage
    for (i=0; i<coursesPerPage && i+offset<courses.length; i++) {
        courseNodes.appendChild(generateHTML(courses[i + offset]))
    }
    document.getElementById("courseTable").replaceChildren(courseNodes)



    for(const paginator of document.getElementsByClassName("paginator")) {
        paginator.getElementsByTagName("p")[0].textContent = `Showing courses ${offset+1} - ${Math.min(offset+coursesPerPage+1, courses.length)} (${currentPage}/${Math.ceil(courses.length / coursesPerPage)} pages)`
    }
    document.getElementById("searchResults").textContent = `Found ${courses.length} courses.`
}



// returns true/false
function matchesSearch(object, search) {

}

class CatalogueHolder {
    constructor(){


        this.courses = []
        this.coursesPerPage = parseInt(document.getElementById("coursesPerPageCount").value)
        this.currentPage = 1 // starts at 1
    }    
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

    function attrColor(attribute) {
        if (object.attributes[attribute])
            return "green"
        else
            return ""
    }


    if (object.attributes === null)
        html += "<p><b>No course attributes available.</b></p>"
    else {
        html += `
        <table>
            <tr> 
                <th class=${attrColor("AR")}>2AR</th> 
                <th class=${attrColor("SC")}>2SC</th> 
                <th class=${attrColor("HUM")}>HUM</th> 
                <th class=${attrColor("LSC")}>LSC</th> 
                <th class=${attrColor("SCI")}>SCI</th> 
                <th class=${attrColor("SOC")}>SOC</th> 
                <th class=${attrColor("UT")}>UT</th> 
            </tr>
            <tr>
                <td class=${attrColor("AR")}>${object.attributes["AR"]}</td>
                <td class=${attrColor("SC")}>${object.attributes["SC"]}</td>
                <td class=${attrColor("HUM")}>${object.attributes["HUM"]}</td>
                <td class=${attrColor("LSC")}>${object.attributes["LSC"]}</td>
                <td class=${attrColor("SCI")}>${object.attributes["SCI"]}</td>
                <td class=${attrColor("SOC")}>${object.attributes["SOC"]}</td>
                <td class=${attrColor("UT")}>${object.attributes["UT"]}</td>
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
                <tr class="${classes} ${t.destination}">
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
    <table class="offeredTable mono"> 
    <thead><th>Semester</th> <th>Seats</th> <th>Waitlist</th> <th>Days</th> <th>Time</th> <th>Room</th> <th>Type</th> <th>Instructor</th></thead>
    `

    for (c of object.offered) {
        html += `<tbody>`
        let s = []
        for (sch of c.schedule) {
            s.push(`
            <td>${sch.days}</td> 
            <td>${sch.time}</td> 
            <td>${sch.room}</td> 
            <td>${sch.instructor}</td>  
            <td>${sch.type}</td> `
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

    if (object.availability == "discontinued") 
        temp.className += " discontinued"

    return temp
}