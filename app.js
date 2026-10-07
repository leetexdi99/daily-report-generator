const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzufXJ-8su8T2FJhDJZNPp4_lgzwzJccr7GMEJo8PY38Lg3oTDd7KDbtlVt-a6S80BWsw/exec";

let trackerData = [];
let generatedWorkAreas = [];

document.addEventListener("DOMContentLoaded", () => {
  setDefaultDate();

  const excelFile = document.getElementById("excelFile");
  const analyzeTrackerBtn = document.getElementById("analyzeTrackerBtn");
  const generateReportBtn = document.getElementById("generateReportBtn");
  const clearReportBtn = document.getElementById("clearReportBtn");
  const copyReportBtn = document.getElementById("copyReportBtn");
  const printReportBtn = document.getElementById("printReportBtn");

  if (excelFile) {
    excelFile.addEventListener("change", handleExcelUpload);
  }

  if (analyzeTrackerBtn) {
    analyzeTrackerBtn.addEventListener("click", analyzeTracker);
  }

  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", generateReport);
  }

  if (clearReportBtn) {
    clearReportBtn.addEventListener("click", clearReport);
  }

  if (copyReportBtn) {
    copyReportBtn.addEventListener("click", copyReport);
  }

  if (printReportBtn) {
    printReportBtn.addEventListener("click", printReport);
  }
});


function setDefaultDate() {
  const dateInput = document.getElementById("reportDate");

  if (dateInput && !dateInput.value) {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
  }
}


/* =========================
   EXCEL UPLOAD
========================= */

async function handleExcelUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  const fileName = document.getElementById("fileName");
  const analysisStatus = document.getElementById("analysisStatus");

  if (fileName) {
    fileName.textContent = file.name;
  }

  if (analysisStatus) {
    analysisStatus.textContent = "Reading Excel tracker...";
    analysisStatus.className = "status-message";
  }

  try {
    await loadSheetJS();

    const arrayBuffer = await file.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, {
      type: "array"
    });

    const firstSheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[firstSheetName];

    trackerData = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    if (!trackerData.length) {
      throw new Error("The Excel file does not contain any data.");
    }

    if (analysisStatus) {
      analysisStatus.textContent =
        `Excel loaded successfully — ${trackerData.length} tracker row(s) found.`;

      analysisStatus.className = "status-message success";
    }

    showTrackerPreview();

  } catch (error) {

    console.error(error);

    trackerData = [];

    if (analysisStatus) {
      analysisStatus.textContent =
        "Error reading Excel: " + error.message;

      analysisStatus.className = "status-message error";
    }
  }
}


/* =========================
   LOAD SHEETJS
========================= */

function loadSheetJS() {
  return new Promise((resolve, reject) => {

    if (window.XLSX) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

    script.onload = () => resolve();

    script.onerror = () =>
      reject(new Error("Unable to load Excel reader."));

    document.head.appendChild(script);
  });
}


/* =========================
   TRACKER PREVIEW
========================= */

function showTrackerPreview() {

  const analysisStatus = document.getElementById("analysisStatus");

  if (!analysisStatus || !trackerData.length) {
    return;
  }

  const previewRows = trackerData
    .slice(0, 5)
    .map(row => {

      const values = Object.values(row);

      return values
        .slice(0, 5)
        .join(" | ");

    })
    .join("\n");

  console.log("Excel preview:");
  console.log(previewRows);
}


/* =========================
   AI ANALYSIS
========================= */

async function analyzeTracker() {

  const analysisStatus =
    document.getElementById("analysisStatus");

  const analyzeButton =
    document.getElementById("analyzeTrackerBtn");

  if (!trackerData.length) {

    if (analysisStatus) {
      analysisStatus.textContent =
        "Please upload an Excel tracker first.";

      analysisStatus.className = "status-message error";
    }

    return;
  }

  const reportPeriod =
    document.getElementById("reportPeriod")?.value || "";

  const reportDate =
    document.getElementById("reportDate")?.value || "";

  const reportTitle =
    document.getElementById("reportTitle")?.value ||
    "Weekly Report (REL-FA)";


  if (!APPS_SCRIPT_URL ||
      APPS_SCRIPT_URL.includes("PASTE_YOUR")) {

    if (analysisStatus) {
      analysisStatus.textContent =
        "Apps Script URL has not been added to app.js.";

      analysisStatus.className = "status-message error";
    }

    return;
  }


  if (analyzeButton) {
    analyzeButton.disabled = true;
    analyzeButton.textContent = "AI Analyzing...";
  }


  if (analysisStatus) {
    analysisStatus.textContent =
      "Sending Excel tracker to Gemini for analysis...";

    analysisStatus.className = "status-message";
  }


  try {

    const response = await fetch(APPS_SCRIPT_URL, {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({

        reportPeriod: reportPeriod,

        reportDate: reportDate,

        reportTitle: reportTitle,

        trackerData: trackerData

      })

    });


    const data = await response.json();


    if (!data.success) {

      throw new Error(
        data.error || "AI analysis failed."
      );

    }


    generatedWorkAreas =
      data.result?.workAreas || [];


    if (!generatedWorkAreas.length) {

      throw new Error(
        "Gemini did not generate any work areas."
      );

    }


    renderGeneratedWorkAreas();


    if (analysisStatus) {

      analysisStatus.textContent =
        `AI analysis completed — ${generatedWorkAreas.length} REL-FA work area(s) generated.`;

      analysisStatus.className =
        "status-message success";
    }


  } catch (error) {

    console.error("AI analysis error:", error);

    if (analysisStatus) {

      analysisStatus.textContent =
        "AI analysis failed: " + error.message;

      analysisStatus.className =
        "status-message error";
    }

  } finally {

    if (analyzeButton) {

      analyzeButton.disabled = false;

      analyzeButton.textContent =
        "Analyze Tracker with AI";

    }

  }
}


/* =========================
   RENDER AI WORK AREAS
========================= */

function renderGeneratedWorkAreas() {

  const container =
    document.getElementById("generatedWorkAreas");

  if (!container) return;


  container.innerHTML = "";


  generatedWorkAreas.forEach((area, index) => {

    const card =
      document.createElement("div");

    card.className =
      "generated-work-area";


    card.innerHTML = `

      <div class="work-area-header">

        <h3>
          ${escapeHtml(area.name || "")}
        </h3>

        <span>
          AI Generated
        </span>

      </div>


      <div class="form-grid">

        <div class="form-group">

          <label>Description</label>

          <input
            type="text"
            class="generated-description"
            value="${escapeAttribute(area.description || "")}"
          >

        </div>


        <div class="form-group">

          <label>Deadline</label>

          <input
            type="text"
            class="generated-deadline"
            value="${escapeAttribute(area.deadline || "")}"
          >

        </div>


        <div class="form-group">

          <label>Status</label>

          <select class="generated-status">

            ${statusOption("Green", area.status)}

            ${statusOption("Yellow", area.status)}

            ${statusOption("Red", area.status)}

          </select>

        </div>


        <div class="form-group">

          <label>Priority</label>

          <select class="generated-priority">

            ${priorityOption("P1", area.priority)}

            ${priorityOption("P2", area.priority)}

          </select>

        </div>

      </div>


      <div class="form-group">

        <label>What</label>

        <textarea
          class="generated-what"
          rows="3"
        >${escapeHtml(area.what || "")}</textarea>

      </div>


      <div class="form-group">

        <label>How</label>

        <textarea
          class="generated-how"
          rows="3"
        >${escapeHtml(area.how || "")}</textarea>

      </div>


      <div class="form-group">

        <label>Next Step</label>

        <textarea
          class="generated-next"
          rows="3"
        >${escapeHtml(area.nextStep || "")}</textarea>

      </div>


      <div class="source-cases">

        <strong>Source Cases:</strong>

        <span>
          ${escapeHtml(
            (area.sourceCases || []).join(", ")
          )}
        </span>

      </div>

    `;


    container.appendChild(card);

  });


  const generateButton =
    document.getElementById("generateReportBtn");

  if (generateButton) {
    generateButton.disabled = false;
  }
}


/* =========================
   REPORT GENERATION
========================= */

function generateReport() {

  const cards =
    document.querySelectorAll(".generated-work-area");

  const reportPreview =
    document.getElementById("reportPreview");

  if (!cards.length) {

    alert(
      "Please analyze the Excel tracker with AI first."
    );

    return;
  }


  let reportHtml = `

    <div class="report-header">

      <h1>
        ${escapeHtml(
          document.getElementById("reportTitle")?.value ||
          "Weekly Report (REL-FA)"
        )}
      </h1>

      <p>
        ${escapeHtml(
          document.getElementById("reportPeriod")?.value ||
          ""
        )}
      </p>

      <p>
        ${escapeHtml(
          document.getElementById("reportDate")?.value ||
          ""
        )}
      </p>

    </div>


    <table class="report-table">

      <thead>

        <tr>
          <th>No</th>
          <th>KPI</th>
          <th>KPI Description</th>
          <th>Deadline</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Comment on Weekly Performance – What & How</th>
        </tr>

      </thead>

      <tbody>
  `;


  cards.forEach((card, index) => {

    const name =
      card.querySelector(".work-area-header h3")
        ?.textContent.trim() || "";

    const description =
      card.querySelector(".generated-description")
        ?.value || "";

    const deadline =
      card.querySelector(".generated-deadline")
        ?.value || "";

    const status =
      card.querySelector(".generated-status")
        ?.value || "";

    const priority =
      card.querySelector(".generated-priority")
        ?.value || "";

    const what =
      card.querySelector(".generated-what")
        ?.value || "";

    const how =
      card.querySelector(".generated-how")
        ?.value || "";

    const nextStep =
      card.querySelector(".generated-next")
        ?.value || "";


    reportHtml += `

      <tr>

        <td>${index + 1}</td>

        <td>
          ${escapeHtml(name)}
        </td>

        <td>
          ${escapeHtml(description)}
        </td>

        <td>
          ${escapeHtml(deadline)}
        </td>

        <td>
          ${escapeHtml(status)}
        </td>

        <td>
          ${escapeHtml(priority)}
        </td>

        <td>

          <strong>What:</strong>
          ${escapeHtml(what)}

          <br><br>

          <strong>How:</strong>
          ${escapeHtml(how)}

          <br><br>

          <strong>Next Step:</strong>
          ${escapeHtml(nextStep)}

        </td>

      </tr>

    `;

  });


  reportHtml += `

      </tbody>

    </table>

  `;


  if (reportPreview) {
    reportPreview.innerHTML = reportHtml;
  }
}


/* =========================
   CLEAR
========================= */

function clearReport() {

  trackerData = [];
  generatedWorkAreas = [];


  const excelFile =
    document.getElementById("excelFile");

  const fileName =
    document.getElementById("fileName");

  const generated =
    document.getElementById("generatedWorkAreas");

  const reportPreview =
    document.getElementById("reportPreview");

  const analysisStatus =
    document.getElementById("analysisStatus");


  if (excelFile) {
    excelFile.value = "";
  }

  if (fileName) {
    fileName.textContent = "No file selected";
  }

  if (generated) {
    generated.innerHTML = "";
  }

  if (reportPreview) {
    reportPreview.innerHTML = "";
  }

  if (analysisStatus) {

    analysisStatus.textContent =
      "Upload an Excel tracker to begin.";

    analysisStatus.className =
      "status-message";

  }
}


/* =========================
   COPY
========================= */

async function copyReport() {

  const reportPreview =
    document.getElementById("reportPreview");

  if (!reportPreview || !reportPreview.innerText.trim()) {

    alert("Generate the report first.");

    return;
  }


  try {

    await navigator.clipboard.writeText(
      reportPreview.innerText
    );

    alert("Report copied to clipboard.");

  } catch (error) {

    alert("Unable to copy the report.");

  }
}


/* =========================
   PRINT
========================= */

function printReport() {

  const reportPreview =
    document.getElementById("reportPreview");

  if (!reportPreview || !reportPreview.innerText.trim()) {

    alert("Generate the report first.");

    return;
  }

  window.print();
}


/* =========================
   HELPERS
========================= */

function statusOption(value, selected) {

  return `
    <option
      value="${value}"
      ${value === selected ? "selected" : ""}
    >
      ${value}
    </option>
  `;
}


function priorityOption(value, selected) {

  return `
    <option
      value="${value}"
      ${value === selected ? "selected" : ""}
    >
      ${value}
    </option>
  `;
}


function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
  return escapeHtml(value);
}
