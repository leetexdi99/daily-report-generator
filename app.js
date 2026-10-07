// ============================================
// AI BACKEND
// ============================================

const AI_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzufXJ-8su8T2FJhDJZNPp4_lgzwzJccr7GMEJo8PY38Lg3oTDd7KDbtlVt-a6S80BWsw/exec";

// ========================================
// REL-FA WEEKLY REPORT GENERATOR
// ========================================


// ----------------------------------------
// INITIALIZE
// ----------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  const dateInput = document.getElementById("reportDate");

  const today = new Date();

  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  if (dateInput) {
    dateInput.value = formattedDate;
  }

});


// ----------------------------------------
// ADD WORK AREA
// ----------------------------------------

function addWorkArea() {

  const container =
    document.getElementById("workAreaContainer");

  const number =
    container.querySelectorAll(".work-area").length + 1;

  const article =
    document.createElement("article");

  article.className = "work-area";

  article.innerHTML = `

    <div class="work-area-header">

      <div class="work-number">
        ${number}
      </div>

      <div class="work-title">

        <input
          class="work-name"
          value="New REL-FA Work Area"
        >

      </div>

    </div>


    <div class="form-group">

      <label>KPI Description</label>

      <textarea
        class="description"
        placeholder="Enter the KPI / work area description..."
      ></textarea>

    </div>


    <div class="three-column">

      <div class="form-group">

        <label>Deadline</label>

        <select class="deadline">

          <option selected>Weekly</option>
          <option>Ongoing</option>
          <option>Custom</option>

        </select>

      </div>


      <div class="form-group">

        <label>Status</label>

        <select class="status">

          <option value="Green" selected>
            🟢 Green
          </option>

          <option value="Yellow">
            🟡 Yellow
          </option>

          <option value="Red">
            🔴 Red
          </option>

        </select>

      </div>


      <div class="form-group">

        <label>Priority</label>

        <select class="priority">

          <option selected>P1</option>
          <option>P2</option>

        </select>

      </div>

    </div>


    <div class="form-group">

      <label>Weekly Activity / Raw Notes</label>

      <textarea
        class="raw-notes"
        placeholder="Enter what happened this week..."
      ></textarea>

    </div>


    <div class="three-column">

      <div class="form-group">

        <label>What</label>

        <textarea
          class="what"
          placeholder="What was accomplished?"
        ></textarea>

      </div>


      <div class="form-group">

        <label>How</label>

        <textarea
          class="how"
          placeholder="How was it accomplished?"
        ></textarea>

      </div>


      <div class="form-group">

        <label>Next Step</label>

        <textarea
          class="next-step"
          placeholder="What happens next?"
        ></textarea>

      </div>

    </div>


    <button
      class="remove-work-area"
      onclick="removeWorkArea(this)"
    >
      Remove Work Area
    </button>

  `;

  container.appendChild(article);

  renumberWorkAreas();
}


// ----------------------------------------
// REMOVE WORK AREA
// ----------------------------------------

function removeWorkArea(button) {

  const area =
    button.closest(".work-area");

  if (!area) {
    return;
  }

  const confirmed =
    confirm(
      "Remove this work area from the report?"
    );

  if (!confirmed) {
    return;
  }

  area.remove();

  renumberWorkAreas();
}


// ----------------------------------------
// RENUMBER WORK AREAS
// ----------------------------------------

function renumberWorkAreas() {

  const areas =
    document.querySelectorAll(".work-area");

  areas.forEach((area, index) => {

    const number =
      area.querySelector(".work-number");

    if (number) {
      number.textContent = index + 1;
    }

  });

}


// ----------------------------------------
// GET WORK AREA DATA
// ----------------------------------------

function getWorkAreaData() {

  const areas =
    document.querySelectorAll(".work-area");

  const data = [];

  areas.forEach(area => {

    const name =
      area.querySelector(".work-name")?.value.trim() || "";

    const description =
      area.querySelector(".description")?.value.trim() || "";

    const deadline =
      area.querySelector(".deadline")?.value || "";

    const status =
      area.querySelector(".status")?.value || "";

    const priority =
      area.querySelector(".priority")?.value || "";

    const rawNotes =
      area.querySelector(".raw-notes")?.value.trim() || "";

    const what =
      area.querySelector(".what")?.value.trim() || "";

    const how =
      area.querySelector(".how")?.value.trim() || "";

    const nextStep =
      area.querySelector(".next-step")?.value.trim() || "";


    data.push({
      name,
      description,
      deadline,
      status,
      priority,
      rawNotes,
      what,
      how,
      nextStep
    });

  });

  return data;
}


// ----------------------------------------
// GENERATE REPORT
// ----------------------------------------

function generateReport() {

  const period =
    document.getElementById("reportPeriod")
      ?.value.trim() || "";

  const date =
    document.getElementById("reportDate")
      ?.value || "";

  const title =
    document.getElementById("reportTitle")
      ?.value.trim() || "Weekly Report (REL-FA)";


  const workAreas =
    getWorkAreaData();


  if (workAreas.length === 0) {

    alert(
      "Please add at least one REL-FA work area."
    );

    return;
  }


  const hasContent =
    workAreas.some(area =>
      area.rawNotes ||
      area.what ||
      area.how ||
      area.nextStep
    );


  if (!hasContent) {

    alert(
      "Please enter some weekly activity information before generating the report."
    );

    return;
  }


  const formattedDate =
    date
      ? new Date(date + "T00:00:00")
          .toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "long",
              day: "numeric"
            }
          )
      : "";


  let tableRows = "";


  workAreas.forEach((area, index) => {

    const statusClass =
      getStatusClass(area.status);


    const statusText =
      getStatusText(area.status);


    const performance =
      buildPerformanceHTML(area);


    tableRows += `

      <tr>

        <td class="report-number">
          ${index + 1}
        </td>


        <td>

          <strong>
            ${escapeHTML(area.name)}
          </strong>

        </td>


        <td>
          ${formatReportText(area.description)}
        </td>


        <td>
          ${escapeHTML(area.deadline)}
        </td>


        <td class="${statusClass}">
          ${statusText}
        </td>


        <td>
          ${escapeHTML(area.priority)}
        </td>


        <td>

          ${performance}

        </td>

      </tr>

    `;

  });


  const reportHTML = `

    <div class="generated-report">


      <h1>
        ${escapeHTML(title)}
      </h1>


      <div class="report-date">

        ${escapeHTML(period)}

        ${period && formattedDate ? " | " : ""}

        ${escapeHTML(formattedDate)}

      </div>


      <div class="report-summary">

        <strong>
          Weekly Performance Summary
        </strong>

        <p style="margin-top:8px;">

          REL-FA activities, investigation progress,
          analytical support, coordination activities
          and follow-up actions for the reporting period.

        </p>

      </div>


      <div class="report-table-wrapper">

        <table class="report-table">

          <thead>

            <tr>

              <th>No.</th>

              <th>
                KPI / Work Area
              </th>

              <th>
                KPI Description
              </th>

              <th>
                Deadline
              </th>

              <th>
                Status
              </th>

              <th>
                Priority
              </th>

              <th>
                Comment on Weekly Performance
                – What &amp; How
              </th>

            </tr>

          </thead>


          <tbody>

            ${tableRows}

          </tbody>

        </table>

      </div>


      <div class="report-section">

        <h3>
          Next Steps
        </h3>


        ${buildNextStepsHTML(workAreas)}

      </div>


    </div>

  `;


  document.getElementById(
    "reportPreview"
  ).innerHTML = reportHTML;


  document.getElementById(
    "reportPreview"
  ).scrollIntoView({
    behavior: "smooth"
  });

}


// ----------------------------------------
// BUILD PERFORMANCE HTML
// ----------------------------------------

function buildPerformanceHTML(area) {

  let html = "";


  if (area.what) {

    html += `

      <div class="performance-item">

        <span class="performance-label">
          What:
        </span>

        ${formatReportText(area.what)}

      </div>

    `;

  }


  if (area.how) {

    html += `

      <div class="performance-item">

        <span class="performance-label">
          How:
        </span>

        ${formatReportText(area.how)}

      </div>

    `;

  }


  if (area.nextStep) {

    html += `

      <div class="performance-item">

        <span class="performance-label">
          Next Step:
        </span>

        ${formatReportText(area.nextStep)}

      </div>

    `;

  }


  if (!html && area.rawNotes) {

    html = formatReportText(area.rawNotes);

  }


  if (!html) {

    html =
      "<em>No weekly performance information entered.</em>";

  }


  return `<div class="performance-block">${html}</div>`;
}


// ----------------------------------------
// BUILD NEXT STEPS
// ----------------------------------------

function buildNextStepsHTML(workAreas) {

  let html = "";


  workAreas.forEach((area, index) => {

    if (!area.nextStep) {
      return;
    }


    html += `

      <div class="performance-item">

        <strong>
          ${index + 1}. ${escapeHTML(area.name)}
        </strong>

        <br>

        ${formatReportText(area.nextStep)}

      </div>

    `;

  });


  if (!html) {

    html =
      "<p>No next steps entered.</p>";

  }


  return html;
}


// ----------------------------------------
// STATUS CLASS
// ----------------------------------------

function getStatusClass(status) {

  switch (status) {

    case "Green":
      return "status-green";

    case "Yellow":
      return "status-yellow";

    case "Red":
      return "status-red";

    default:
      return "";

  }

}


// ----------------------------------------
// STATUS TEXT
// ----------------------------------------

function getStatusText(status) {

  switch (status) {

    case "Green":
      return "🟢 Green";

    case "Yellow":
      return "🟡 Yellow";

    case "Red":
      return "🔴 Red";

    default:
      return escapeHTML(status);

  }

}


// ----------------------------------------
// FORMAT REPORT TEXT
// ----------------------------------------

function formatReportText(text) {

  return escapeHTML(text)
    .replace(/\n/g, "<br>");

}


// ----------------------------------------
// ESCAPE HTML
// ----------------------------------------

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ----------------------------------------
// COPY REPORT
// ----------------------------------------

async function copyReport() {

  const report =
    document.getElementById("reportPreview");


  if (!report || !report.innerText.trim()) {

    alert(
      "There is no report to copy."
    );

    return;
  }


  try {

    await navigator.clipboard.writeText(
      report.innerText
    );

    alert(
      "Report copied to clipboard."
    );

  } catch (error) {

    alert(
      "Unable to copy automatically. Please copy the report manually."
    );

  }

}


// ----------------------------------------
// PRINT / PDF
// ----------------------------------------

function printReport() {

  const report =
    document.getElementById("reportPreview");


  if (!report || !report.innerText.trim()) {

    alert(
      "There is no report to print."
    );

    return;
  }


  window.print();

}


// ----------------------------------------
// CLEAR REPORT
// ----------------------------------------

function clearReport() {

  const confirmed =
    confirm(
      "Clear all entered weekly information?"
    );


  if (!confirmed) {
    return;
  }


  document.getElementById(
    "reportPeriod"
  ).value = "WW40";


  document.getElementById(
    "reportTitle"
  ).value = "Weekly Report (REL-FA)";


  const areas =
    document.querySelectorAll(".work-area");


  areas.forEach(area => {

    const rawNotes =
      area.querySelector(".raw-notes");

    const what =
      area.querySelector(".what");

    const how =
      area.querySelector(".how");

    const nextStep =
      area.querySelector(".next-step");


    if (rawNotes) rawNotes.value = "";

    if (what) what.value = "";

    if (how) how.value = "";

    if (nextStep) nextStep.value = "";

  });


  document.getElementById(
    "reportPreview"
  ).innerHTML = `

    <div class="empty-state">

      <div class="empty-icon">
        📋
      </div>

      <h3>
        No report generated yet
      </h3>

      <p>
        Update your weekly activities and click
        <strong>Generate Report</strong>.
      </p>

    </div>

  `;

}
// ============================================
// AI GENERATE - REL-FA
// ============================================

function addAIButtons() {
  const workAreas = document.querySelectorAll(".work-area");

  workAreas.forEach((area, index) => {

    // Don't add the button twice
    if (area.querySelector(".ai-generate-btn")) {
      return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.className = "ai-generate-btn";
    button.textContent = "🤖 Generate with AI";

    button.style.marginTop = "10px";
    button.style.padding = "10px 16px";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.background = "#2563eb";
    button.style.color = "white";
    button.style.cursor = "pointer";
    button.style.fontWeight = "600";

    button.addEventListener("click", function () {
      generateAIForWorkArea(area, button);
    });

    // Put button after the raw notes section
    const rawNotesField =
      area.querySelector('[id*="activity"]') ||
      area.querySelector('[id*="raw"]');

    if (rawNotesField) {
      rawNotesField.parentElement.appendChild(button);
    } else {
      area.appendChild(button);
    }
  });
}


// ============================================
// SEND WORK AREA TO GEMINI
// ============================================

async function generateAIForWorkArea(area, button) {

  const originalText = button.textContent;

  try {

    button.disabled = true;
    button.textContent = "🤖 AI is working...";

    // Find fields inside this work area
    const rawNotes =
      area.querySelector('[id*="activity"]') ||
      area.querySelector('[id*="raw"]');

    const whatField =
      area.querySelector('[id*="what"]');

    const howField =
      area.querySelector('[id*="how"]');

    const nextStepField =
      area.querySelector('[id*="next"]');

    // Get KPI / Work Area name
    const kpiField =
      area.querySelector('[id*="kpi"]') ||
      area.querySelector('input[type="text"]');

    // Get description
    const descriptionField =
      area.querySelector('textarea');

    if (!rawNotes || !rawNotes.value.trim()) {
      alert("Please enter your Weekly Activity / Raw Notes first.");
      return;
    }

    // Find status and priority
    const selects = area.querySelectorAll("select");

    let status = "";
    let priority = "";

    selects.forEach(select => {

      const id = (select.id || "").toLowerCase();

      if (id.includes("status")) {
        status = select.value;
      }

      if (id.includes("priority")) {
        priority = select.value;
      }
    });

    const payload = {
      kpi: kpiField ? kpiField.value : "",
      description: descriptionField ? descriptionField.value : "",
      status: status,
      priority: priority,
      rawNotes: rawNotes.value
    };

    // Call Google Apps Script
    const response = await fetch(AI_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "AI request failed.");
    }

    // Put AI result into the form
    if (whatField) {
      whatField.value = data.result.what || "";
    }

    if (howField) {
      howField.value = data.result.how || "";
    }

    if (nextStepField) {
      nextStepField.value = data.result.nextStep || "";
    }

    button.textContent = "✅ AI Generated";

    setTimeout(() => {
      button.textContent = originalText;
    }, 2500);

  } catch (error) {

    console.error("AI Error:", error);

    alert(
      "AI generation failed.\n\n" +
      error.message
    );

    button.textContent = originalText;

  } finally {

    button.disabled = false;
  }
}


// Add AI buttons when the page loads
document.addEventListener("DOMContentLoaded", function () {
  addAIButtons();
});
