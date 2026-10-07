// ----------------------------------------
// INITIALIZE DATE
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

  dateInput.value = formattedDate;

});


// ----------------------------------------
// ADD KPI
// ----------------------------------------

function addKPI() {

  const container =
    document.getElementById("kpiContainer");

  const row = document.createElement("div");

  row.className = "kpi-row";

  row.innerHTML = `
    <input
      type="text"
      class="kpi-name"
      placeholder="KPI name"
    >

    <input
      type="text"
      class="kpi-value"
      placeholder="Actual"
    >

    <input
      type="text"
      class="kpi-target"
      placeholder="Target"
    >

    <button
      class="remove-btn"
      onclick="removeKPI(this)"
      title="Remove KPI"
    >
      ×
    </button>
  `;

  container.appendChild(row);
}


// ----------------------------------------
// REMOVE KPI
// ----------------------------------------

function removeKPI(button) {

  const row = button.closest(".kpi-row");

  if (row) {
    row.remove();
  }

}


// ----------------------------------------
// GET KPI DATA
// ----------------------------------------

function getKPIData() {

  const rows =
    document.querySelectorAll(".kpi-row");

  const kpis = [];

  rows.forEach(row => {

    const name =
      row.querySelector(".kpi-name").value.trim();

    const value =
      row.querySelector(".kpi-value").value.trim();

    const target =
      row.querySelector(".kpi-target").value.trim();

    if (name || value || target) {

      kpis.push({
        name,
        value,
        target
      });

    }

  });

  return kpis;
}


// ----------------------------------------
// GENERATE REPORT
// ----------------------------------------

function generateReport() {

  const date =
    document.getElementById("reportDate").value;

  const title =
    document.getElementById("reportTitle").value.trim();

  const notes =
    document.getElementById("dailyNotes").value.trim();

  const kpis = getKPIData();


  if (!title) {

    alert("Please enter a report title.");

    return;

  }


  if (kpis.length === 0 && !notes) {

    alert(
      "Please enter at least one KPI or some daily notes."
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
      : "No date specified";


  let kpiRows = "";

  kpis.forEach(kpi => {

    kpiRows += `
      <tr>
        <td>${escapeHTML(kpi.name)}</td>
        <td>${escapeHTML(kpi.value)}</td>
        <td>${escapeHTML(kpi.target)}</td>
      </tr>
    `;

  });


  const reportHTML = `

    <div class="generated-report">

      <h1>${escapeHTML(title)}</h1>

      <div class="report-date">
        ${escapeHTML(formattedDate)}
      </div>


      <div class="summary-box">

        <strong>Daily Summary</strong>

        <p style="margin-top:8px;">
          This report contains the daily KPI information
          and operational notes entered for this date.
          AI analysis will be added in the next stage.
        </p>

      </div>


      <div class="report-section">

        <h3>Key Performance Indicators</h3>

        ${
          kpis.length > 0
            ? `
              <table class="kpi-table">

                <thead>
                  <tr>
                    <th>KPI</th>
                    <th>Actual</th>
                    <th>Target</th>
                  </tr>
                </thead>

                <tbody>
                  ${kpiRows}
                </tbody>

              </table>
            `
            : "<p>No KPI data entered.</p>"
        }

      </div>


      <div class="report-section">

        <h3>Daily Notes</h3>

        ${
          notes
            ? `
              <div class="summary-box">
                ${formatNotes(notes)}
              </div>
            `
            : "<p>No daily notes entered.</p>"
        }

      </div>


      <div class="report-section">

        <h3>AI Analysis</h3>

        <div class="warning">

          AI analysis will be connected in Stage 2.

          The next version will automatically analyze
          your KPIs and notes and generate:

          <ul>
            <li>Executive summary</li>
            <li>Performance analysis</li>
            <li>Positive highlights</li>
            <li>Risks and problems</li>
            <li>Recommendations</li>
            <li>Priorities for tomorrow</li>
          </ul>

        </div>

      </div>

    </div>

  `;


  document.getElementById("reportPreview").innerHTML =
    reportHTML;


  document
    .getElementById("reportPreview")
    .scrollIntoView({
      behavior: "smooth"
    });

}


// ----------------------------------------
// FORMAT NOTES
// ----------------------------------------

function formatNotes(text) {

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
// CLEAR
// ----------------------------------------

function clearReport() {

  const confirmed =
    confirm(
      "Clear all report information?"
    );

  if (!confirmed) {
    return;
  }


  document.getElementById("reportTitle").value =
    "Daily Operations Report";

  document.getElementById("dailyNotes").value =
    "";

  document.getElementById("kpiContainer").innerHTML =
    "";


  addKPI();
  addKPI();
  addKPI();


  document.getElementById("reportPreview").innerHTML = `

    <div class="empty-state">

      <div class="empty-icon">📊</div>

      <h3>No report generated yet</h3>

      <p>
        Enter your daily information above and click
        <strong>Generate Report</strong>.
      </p>

    </div>

  `;

}


// ----------------------------------------
// COPY REPORT
// ----------------------------------------

async function copyReport() {

  const report =
    document.getElementById("reportPreview");

  if (!report.innerText.trim()) {

    alert("There is no report to copy.");

    return;

  }


  try {

    await navigator.clipboard.writeText(
      report.innerText
    );

    alert("Report copied to clipboard.");

  } catch (error) {

    alert(
      "Unable to copy automatically. Please select and copy the report manually."
    );

  }

}


// ----------------------------------------
// PRINT
// ----------------------------------------

function printReport() {

  const report =
    document.getElementById("reportPreview");

  if (!report.innerText.trim()) {

    alert("There is no report to print.");

    return;

  }

  window.print();

}
