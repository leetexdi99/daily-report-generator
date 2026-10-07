// ============================================
// REL-FA WEEKLY REPORT GENERATOR
// EXCEL TRACKER VERSION
// ============================================

let trackerData = [];


// ============================================
// INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // Set today's date
  const dateInput =
    document.getElementById("reportDate");

  if (dateInput) {

    const today = new Date();

    const formattedDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    dateInput.value = formattedDate;
  }


  // Excel file selection
  const excelFile =
    document.getElementById("excelFile");

  if (excelFile) {

    excelFile.addEventListener(
      "change",
      handleExcelFile
    );
  }


  // Buttons
  const analyzeButton =
    document.getElementById(
      "analyzeTrackerBtn"
    );

  if (analyzeButton) {

    analyzeButton.addEventListener(
      "click",
      analyzeTracker
    );
  }


  const generateButton =
    document.getElementById(
      "generateReportBtn"
    );

  if (generateButton) {

    generateButton.addEventListener(
      "click",
      generateReport
    );
  }


  const clearButton =
    document.getElementById(
      "clearReportBtn"
    );

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearReport
    );
  }


  const copyButton =
    document.getElementById(
      "copyReportBtn"
    );

  if (copyButton) {

    copyButton.addEventListener(
      "click",
      copyReport
    );
  }


  const printButton =
    document.getElementById(
      "printReportBtn"
    );

  if (printButton) {

    printButton.addEventListener(
      "click",
      printReport
    );
  }

});


// ============================================
// LOAD SHEETJS
// ============================================

function loadSheetJS() {

  return new Promise((resolve, reject) => {

    // Already loaded
    if (window.XLSX) {
      resolve();
      return;
    }


    const script =
      document.createElement("script");

    script.src =
      "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

    script.onload = () => resolve();

    script.onerror = () => {
      reject(
        new Error(
          "Unable to load the Excel reader."
        )
      );
    };

    document.head.appendChild(script);

  });

}


// ============================================
// HANDLE EXCEL FILE
// ============================================

async function handleExcelFile(event) {

  const file =
    event.target.files[0];

  if (!file) {
    return;
  }


  const fileName =
    document.getElementById("fileName");

  if (fileName) {

    fileName.textContent =
      "📄 " + file.name;
  }


  setAnalysisStatus(
    "Loading Excel file...",
    "loading"
  );


  try {

    await loadSheetJS();

    const buffer =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(
        buffer,
        {
          type: "array"
        }
      );


    if (
      !workbook.SheetNames ||
      workbook.SheetNames.length === 0
    ) {

      throw new Error(
        "The Excel file does not contain a worksheet."
      );
    }


    // Use the first worksheet
    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];


    trackerData =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: ""
        }
      );


    if (trackerData.length === 0) {

      throw new Error(
        "The selected worksheet is empty."
      );
    }


    console.log(
      "Excel tracker loaded:",
      trackerData
    );


    setAnalysisStatus(
      "Excel loaded successfully: " +
      trackerData.length +
      " tracker row(s) found.",
      "success"
    );


    showTrackerPreview();

  } catch (error) {

    console.error(
      "Excel loading error:",
      error
    );


    trackerData = [];


    setAnalysisStatus(
      "Excel loading failed: " +
      error.message,
      "error"
    );

  }

}


// ============================================
// SHOW TRACKER PREVIEW
// ============================================

function showTrackerPreview() {

  const container =
    document.getElementById(
      "generatedWorkAreas"
    );

  if (!container) {
    return;
  }


  const previewRows =
    trackerData.slice(0, 10);


  let html = `

    <div class="tracker-preview">

      <h3>
        📊 Excel Tracker Loaded
      </h3>

      <p>
        Showing the first
        ${previewRows.length}
        row(s) for verification.
      </p>

      <div class="report-table-wrapper">

        <table class="report-table">

          <thead>

            <tr>

  `;


  // Get column names
  const columns =
    Object.keys(trackerData[0]);


  columns.forEach(column => {

    html += `
      <th>
        ${escapeHTML(column)}
      </th>
    `;

  });


  html += `

            </tr>

          </thead>

          <tbody>

  `;


  previewRows.forEach(row => {

    html += "<tr>";


    columns.forEach(column => {

      const value =
        row[column] ?? "";


      html += `
        <td>
          ${formatReportText(
            String(value)
          )}
        </td>
      `;

    });


    html += "</tr>";

  });


  html += `

          </tbody>

        </table>

      </div>

      <p style="margin-top:15px;">
        ✅ The tracker was read successfully.
        The next step will send this data to Gemini
        for REL-FA report generation.
      </p>

    </div>

  `;


  container.innerHTML = html;

}


// ============================================
// ANALYZE TRACKER
// ============================================

async function analyzeTracker() {

  if (!trackerData.length) {

    alert(
      "Please upload your Excel tracker first."
    );

    return;
  }


  /*
   * Gemini connection will be added in the
   * next step.
   *
   * For now, this verifies that the Excel
   * data is available to the application.
   */

  setAnalysisStatus(
    "✅ Excel data is ready for AI analysis. " +
    "The Gemini report-generation step will be connected next.",
    "success"
  );

}


// ============================================
// GENERATE REPORT
// ============================================

function generateReport() {

  const container =
    document.getElementById(
      "generatedWorkAreas"
    );


  if (!container) {
    return;
  }


  const generatedAreas =
    container.querySelectorAll(
      ".generated-work-area"
    );


  if (generatedAreas.length === 0) {

    alert(
      "Please analyze the Excel tracker first."
    );

    return;
  }


  const period =
    document.getElementById(
      "reportPeriod"
    )?.value || "";


  const date =
    document.getElementById(
      "reportDate"
    )?.value || "";


  const title =
    document.getElementById(
      "reportTitle"
    )?.value ||
    "Weekly Report (REL-FA)";


  let rows = "";


  generatedAreas.forEach(
    (area, index) => {

      const name =
        area.querySelector(
          ".generated-name"
        )?.value || "";


      const description =
        area.querySelector(
          ".generated-description"
        )?.value || "";


      const deadline =
        area.querySelector(
          ".generated-deadline"
        )?.value || "Weekly";


      const status =
        area.querySelector(
          ".generated-status"
        )?.value || "Green";


      const priority =
        area.querySelector(
          ".generated-priority"
        )?.value || "P1";


      const what =
        area.querySelector(
          ".generated-what"
        )?.value || "";


      const how =
        area.querySelector(
          ".generated-how"
        )?.value || "";


      const nextStep =
        area.querySelector(
          ".generated-next"
        )?.value || "";


      rows += `

        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            <strong>
              ${escapeHTML(name)}
            </strong>
          </td>

          <td>
            ${formatReportText(description)}
          </td>

          <td>
            ${escapeHTML(deadline)}
          </td>

          <td>
            ${escapeHTML(status)}
          </td>

          <td>
            ${escapeHTML(priority)}
          </td>

          <td>

            <strong>What:</strong>
            ${formatReportText(what)}

            <br><br>

            <strong>How:</strong>
            ${formatReportText(how)}

          </td>

        </tr>

      `;

    }
  );


  const nextSteps =
    Array.from(
      generatedAreas
    )
    .map(area => {

      const name =
        area.querySelector(
          ".generated-name"
        )?.value || "";

      const next =
        area.querySelector(
          ".generated-next"
        )?.value || "";

      if (!next) {
        return "";
      }

      return `
        <div class="performance-item">

          <strong>
            ${escapeHTML(name)}
          </strong>

          <br>

          ${formatReportText(next)}

        </div>
      `;

    })
    .join("");


  const formattedDate =
    date
      ? new Date(
          date + "T00:00:00"
        ).toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric"
          }
        )
      : "";


  const reportHTML = `

    <div class="generated-report">

      <h1>
        ${escapeHTML(title)}
      </h1>

      <div class="report-date">

        ${escapeHTML(period)}

        ${
          period && formattedDate
            ? " | "
            : ""
        }

        ${escapeHTML(formattedDate)}

      </div>


      <div class="report-table-wrapper">

        <table class="report-table">

          <thead>

            <tr>

              <th>No.</th>

              <th>KPI / Work Area</th>

              <th>KPI Description</th>

              <th>Deadline</th>

              <th>Status</th>

              <th>Priority</th>

              <th>
                Comment on Weekly Performance
                – What & How
              </th>

            </tr>

          </thead>

          <tbody>

            ${rows}

          </tbody>

        </table>

      </div>


      <div class="report-section">

        <h3>
          Next Steps
        </h3>

        ${
          nextSteps ||
          "<p>No next steps entered.</p>"
        }

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


// ============================================
// CLEAR
// ============================================

function clearReport() {

  const confirmed =
    confirm(
      "Clear the uploaded tracker and report?"
    );


  if (!confirmed) {
    return;
  }


  trackerData = [];


  const fileInput =
    document.getElementById(
      "excelFile"
    );

  if (fileInput) {
    fileInput.value = "";
  }


  const fileName =
    document.getElementById(
      "fileName"
    );

  if (fileName) {
    fileName.textContent =
      "No file selected";
  }


  document.getElementById(
    "generatedWorkAreas"
  ).innerHTML = `

    <div class="empty-state">

      <div class="empty-icon">
        🤖
      </div>

      <h3>
        No analysis yet
      </h3>

      <p>
        Upload your Excel tracker and click
        <strong>Analyze Tracker</strong>.
      </p>

    </div>

  `;


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
        Complete the AI analysis and generate
        your weekly report.
      </p>

    </div>

  `;


  setAnalysisStatus(
    "",
    ""
  );

}


// ============================================
// COPY REPORT
// ============================================

async function copyReport() {

  const report =
    document.getElementById(
      "reportPreview"
    );


  if (
    !report ||
    !report.innerText.trim()
  ) {

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
      "Unable to copy automatically."
    );

  }

}


// ============================================
// PRINT
// ============================================

function printReport() {

  const report =
    document.getElementById(
      "reportPreview"
    );


  if (
    !report ||
    !report.innerText.trim()
  ) {

    alert(
      "There is no report to print."
    );

    return;
  }


  window.print();

}


// ============================================
// STATUS MESSAGE
// ============================================

function setAnalysisStatus(
  message,
  type
) {

  const status =
    document.getElementById(
      "analysisStatus"
    );


  if (!status) {
    return;
  }


  status.className =
    "analysis-status " +
    (type || "");


  status.textContent =
    message || "";

}


// ============================================
// FORMAT TEXT
// ============================================

function formatReportText(text) {

  return escapeHTML(
    text
  ).replace(
    /\n/g,
    "<br>"
  );

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
