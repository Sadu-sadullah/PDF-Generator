// Salary mapping definitions
const designationSalaries = {
  "Software Engineer": "$95,000.00 USD / Year",
  "Project Manager": "$85,000.00 USD / Year",
  "Data Analyst": "$75,000.00 USD / Year",
  "Financial Consultant": "$90,000.00 USD / Year",
  "HR Specialist": "$65,000.00 USD / Year",
};

// Auto-populate salary handler
document.addEventListener("DOMContentLoaded", () => {
  const designationSelect = document.getElementById("designationSelect");
  const salaryInput = document.getElementById("salaryInput");

  if (designationSelect && salaryInput) {
    designationSelect.addEventListener("change", function () {
      const selectedVal = this.value;
      salaryInput.value = designationSalaries[selectedVal] || "";
    });
  }
});

// Global state trackers
let currentDocId = "";
let currentRecord = null;
let currentVerifyUrl = "";
let isNewLetterGenerated = false;

// Submit Listener: Loads local draft into sandbox modal for user review (NO server write yet)
document
  .getElementById("certificateForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Compile temporary draft details object
    const formData = new FormData(this);
    const draftRecord = {
      doc_id: "DRAFT-PREVIEW",
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      nationality: formData.get("nationality"),
      passport: formData.get("passport"),
      dob: formData.get("dob"),
      designation: formData.get("designation"),
      salary: formData.get("salary"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      certificate_title: formData.get("certificate_title"),
      issue_date: formData.get("issue_date"),
      expiry_date: formData.get("expiry_date"),
      authority: formData.get("authority"),
      timezone: formData.get("timezone"),
    };

    // 1. Clone the clean layout template into the modal preview area
    const previewArea = document.getElementById("visualPreviewArea");
    const templateSrc = document.getElementById("pdfRenderingTemplate");

    if (previewArea && templateSrc) {
      const templateClone = templateSrc.cloneNode(true);
      templateClone.id = "clonedPdfTemplate";
      previewArea.innerHTML = "";
      previewArea.appendChild(templateClone);
    }

    // 2. Populate cloned version with the Draft record values
    // Using a draft placeholder URL for the temporary QR Code
    const draftVerifyUrl =
      "https://your-domain.com/verify.php?doc_id=DRAFT-PREVIEW";
    populateTemplate(draftRecord, draftVerifyUrl);

    // 3. Set Modal UI to PRE-GENERATION REVIEW STATE
    document.getElementById("modalHeaderReview").classList.remove("hidden");
    document.getElementById("modalHeaderFinal").classList.add("hidden");
    document.getElementById("panelReviewState").classList.remove("hidden");
    document.getElementById("panelFinalState").classList.add("hidden");

    const modalDocIdEl = document.getElementById("modalDocId");
    if (modalDocIdEl) {
      modalDocIdEl.textContent = "Doc ID: DRAFT-PREVIEW";
    }

    // Open Modal for review
    openModal();
  });

// Final Validation & Server Generation Controller
async function confirmAndGenerate() {
  const confirmSaveBtn = document.getElementById("confirmSaveBtn");
  const confirmBtnText = document.getElementById("confirmBtnText");
  const confirmSpinner = document.getElementById("confirmSpinner");

  // UI Loading state
  confirmSaveBtn.disabled = true;
  confirmSpinner.classList.remove("hidden");
  confirmBtnText.textContent = "Registering & Compiling...";

  const form = document.getElementById("certificateForm");
  const formData = new FormData(form);
  let rawResponseText = "";

  try {
    // Post data to the server database
    const response = await fetch("generate_pdf.php", {
      method: "POST",
      body: formData,
    });

    rawResponseText = await response.text();
    const resData = JSON.parse(rawResponseText);

    if (resData.status === "success") {
      currentDocId = resData.doc_id;
      currentRecord = resData.data;
      currentVerifyUrl = resData.verify_url;

      isNewLetterGenerated = true; // Mark as generated so closing modal triggers page reload

      // 1. Re-populate both templates with the permanent, registered details
      populateTemplate(currentRecord, currentVerifyUrl);

      // 2. Re-render cloned modal preview with permanent registered values
      const previewArea = document.getElementById("visualPreviewArea");
      const templateSrc = document.getElementById("pdfRenderingTemplate");
      if (previewArea && templateSrc) {
        const templateClone = templateSrc.cloneNode(true);
        templateClone.id = "clonedPdfTemplate";
        previewArea.innerHTML = "";
        previewArea.appendChild(templateClone);
        populateTemplate(currentRecord, currentVerifyUrl); // Re-bind images and details to clone
      }

      // 3. Transition Modal UI to POST-GENERATION TASK STATE
      document.getElementById("modalHeaderReview").classList.add("hidden");
      document.getElementById("modalHeaderFinal").classList.remove("hidden");
      document.getElementById("panelReviewState").classList.add("hidden");
      document.getElementById("panelFinalState").classList.remove("hidden");

      const modalDocIdEl = document.getElementById("modalDocId");
      if (modalDocIdEl) modalDocIdEl.textContent = `Doc ID: ${currentDocId}`;

      const targetEmailEl = document.getElementById("targetEmail");
      if (targetEmailEl) targetEmailEl.value = currentRecord.email;
    } else {
      alert(resData.message || "Error occurred while saving entry.");
    }
  } catch (error) {
    console.error("Raw Server Response:", rawResponseText);
    console.error("JS Processing Error details:", error);
    alert("Browser JavaScript Error: " + error.message);
  } finally {
    // Reset button loading state
    confirmSaveBtn.disabled = false;
    confirmSpinner.classList.add("hidden");
    confirmBtnText.textContent = "Confirm & Save Letter";
  }
}

// Helper: Safely sets text values without crashing if selectors are missing
function setSelectorText(selector, value) {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    elements.forEach((el) => {
      el.textContent = value;
    });
  }
}

function populateTemplate(record, verifyUrl) {
  // Generate standard image-based QR Code via secure API (Bypasses local canvas rendering bugs)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
  const qrImages = document.querySelectorAll(".pdf-val-qr-img");
  if (qrImages.length > 0) {
    qrImages.forEach((img) => {
      img.src = qrImageUrl;
    });
  }

  // Populate selectors with safety checks across all elements
  setSelectorText(".pdf-val-doc_id", record.doc_id);

  // NEW: Populates Designation & Salary Fields
  setSelectorText(".pdf-val-designation", record.designation);
  setSelectorText(".pdf-val-salary", record.salary);

  // Updated: Includes time stamp & timezone variables in presentation
  setSelectorText(
    ".pdf-val-issue_date",
    formatDateTime(record.issue_date, record.timezone),
  );
  setSelectorText(
    ".pdf-val-expiry_date",
    formatDateTime(record.expiry_date, record.timezone),
  );
  setSelectorText(".pdf-val-certificate_title", record.certificate_title);

  setSelectorText(".pdf-val-name", `${record.first_name} ${record.last_name}`);
  setSelectorText(".pdf-val-nationality", record.nationality);
  setSelectorText(".pdf-val-passport", record.passport);
  setSelectorText(".pdf-val-dob", formatDateLong(record.dob));

  setSelectorText(".pdf-val-authority", record.authority);
  setSelectorText(
    ".pdf-val-issue_date_long",
    formatDateTime(record.issue_date, record.timezone),
  );
  setSelectorText(
    ".pdf-val-expiry_date_long",
    `Valid Until ${formatDateTime(record.expiry_date, record.timezone)}`,
  );
}

// New Formatters for detailed DateTime and Timezone presentation
function formatDateTime(dateTimeString, timezone) {
  const d = new Date(dateTimeString);
  if (isNaN(d.getTime())) return dateTimeString;

  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // 12-Hour conversion logic
  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert hour '0' to '12'
  const formattedHours = String(hours).padStart(2, "0");

  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${months[d.getMonth()]}-${d.getFullYear()} ${formattedHours}:${minutes} ${ampm} (${timezone})`;
}

function formatDateLong(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// PDF Generation Options (Removes html2canvas height limits to allow multi-page capture)
function getHtml2PdfOptions() {
  const letterTitle =
    currentRecord && currentRecord.certificate_title
      ? currentRecord.certificate_title.replace(/\s+/g, "_")
      : "Letter";

  return {
    margin: 0,
    filename: `${letterTitle}_${currentDocId}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0,
      // Removed: hardcoded width and height limits to allow full multi-page canvas capture
    },
    jsPDF: {
      unit: "px",
      format: [794, 1123], // Matches individual page layout sizes
      orientation: "portrait",
      hotfixes: ["px_scaling"],
    },
    pagebreak: { mode: "css" },
  };
}

// Download PDF directly from the visible, fully-rendered modal preview
function triggerPDFDownload() {
  // Targets the active, visible sandbox element directly to prevent offscreen rendering issues
  const element =
    document.getElementById("clonedPdfTemplate") ||
    document.getElementById("pdfRenderingTemplate");
  if (element) {
    html2pdf().set(getHtml2PdfOptions()).from(element).save();
  }
}

// Print PDF from the visible, fully-rendered modal preview
function triggerPDFPrint() {
  const element =
    document.getElementById("clonedPdfTemplate") ||
    document.getElementById("pdfRenderingTemplate");
  if (element) {
    html2pdf()
      .set(getHtml2PdfOptions())
      .from(element)
      .toPdf()
      .get("pdf")
      .then(function (pdf) {
        window.open(pdf.output("bloburl"), "_blank").print();
      });
  }
}

// Modal Handlers
function openModal() {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

// Modal Handlers
function closeModal() {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    const status = document.getElementById("emailStatus");
    if (status) status.classList.add("hidden");

    // NEW: If a new letter was just created, reload to empty inputs & refresh archive table
    if (isNewLetterGenerated) {
      isNewLetterGenerated = false; // Reset tracker
      window.location.reload();
    }
  }
}

// Native System Share Handler
async function shareDocument() {
  const shareStatus = document.getElementById("shareStatus");
  if (!shareStatus) return;

  shareStatus.className = "text-[10px] mt-1.5 text-blue-600";
  shareStatus.textContent = "Compiling PDF file...";
  shareStatus.classList.remove("hidden");

  try {
    const element = document.getElementById("pdfRenderingTemplate");
    if (!element) return;

    // Generate PDF as a binary blob in the background
    const pdfBlob = await html2pdf()
      .set(getHtml2PdfOptions())
      .from(element)
      .outputPdf("blob");
    const pdfFile = new File([pdfBlob], `letter_${currentDocId}.pdf`, {
      type: "application/pdf",
    });

    // Check if the platform's browser supports sharing files natively (WhatsApp, AirDrop, etc.)
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      shareStatus.textContent = "Opening system share menu...";

      await navigator.share({
        files: [pdfFile],
        title: `Official Letter - ${currentDocId}`,
        text: `Please find the official letter for ${currentRecord.first_name} ${currentRecord.last_name} (ID: ${currentDocId}) attached.\n\nVerify details here: ${currentVerifyUrl}`,
      });

      shareStatus.className =
        "text-[10px] mt-1.5 text-emerald-600 font-semibold";
      shareStatus.textContent = "Shared successfully.";
    } else {
      // Fallback for browsers that block native file sharing
      console.log(
        "Web Share API not fully supported. Offering standard email client fallback.",
      );

      const subject = encodeURIComponent(
        `Official Statement of Clearance - ${currentDocId}`,
      );
      const body = encodeURIComponent(
        `Hello,\n\n` +
          `Please find the official verification registry details below:\n\n` +
          `Document Reference: ${currentDocId}\n` +
          `Recipient: ${currentRecord.first_name} ${currentRecord.last_name}\n` +
          `Letter Title: ${currentRecord.certificate_title}\n` +
          `Registry Verification Link: ${currentVerifyUrl}\n\n` +
          `Please attach your downloaded letter PDF (letter_${currentDocId}.pdf) to this message before sending.`,
      );

      // Ask user if they want to launch mail client
      const launchMail = confirm(
        "Direct file-sharing is not supported by this browser version. Would you like to draft an email fallback instead?",
      );
      if (launchMail) {
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }

      shareStatus.className = "text-[10px] mt-1.5 text-amber-600 font-semibold";
      shareStatus.textContent =
        "Sharing not supported. Please use the Download button to share manually.";
    }
  } catch (err) {
    console.error("Sharing failed:", err);
    shareStatus.className = "text-[10px] mt-1.5 text-red-500 font-semibold";
    shareStatus.textContent = "Sharing cancelled or failed.";
  }
}

// ==========================================
// ARCHIVE LOOKUP, FILTRATION & PAGINATION ENGINE
// ==========================================

// Global State Variables for Archive
let activeRecordsList = [];
let filteredRecordsList = [];
let archiveCurrentPage = 1;
const recordsPerPage = 10;

// Initialize Archive Engine on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  // Populate active database list from server-injected script
  if (typeof databaseInjectedRecords !== "undefined") {
    activeRecordsList = Object.values(databaseInjectedRecords).reverse(); // Newest first
  }
  filteredRecordsList = [...activeRecordsList];
  renderArchivePage();
});

// Tab Switcher Controller
function switchTab(targetTab) {
  const tabGen = document.getElementById("tabPanelGenerate");
  const tabArc = document.getElementById("tabPanelArchive");
  const btnGen = document.getElementById("tabBtnGenerate");
  const btnArc = document.getElementById("tabBtnArchive");

  if (targetTab === "generate") {
    tabGen.classList.remove("hidden");
    tabArc.classList.add("hidden");

    btnGen.className =
      "px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 bg-white text-slate-900 shadow-sm";
    btnArc.className =
      "px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900";
  } else {
    tabGen.classList.add("hidden");
    tabArc.classList.remove("hidden");

    btnGen.className =
      "px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900";
    btnArc.className =
      "px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 bg-white text-slate-900 shadow-sm";

    // Refresh values on render trigger
    renderArchivePage();
  }
}

// Filtration and Query Search Logic
function applyFilters() {
  const searchVal = document
    .getElementById("archiveSearch")
    .value.toLowerCase()
    .trim();
  const statusVal = document.getElementById("filterStatus").value;
  const typeVal = document.getElementById("filterType").value;
  const todayStr = new Date().toISOString().split("T")[0]; // Format comparison: YYYY-MM-DD

  filteredRecordsList = activeRecordsList.filter((record) => {
    // Query check: Doc ID, First Name, Last Name, or Passport ID
    const matchSearch =
      !searchVal ||
      record.doc_id.toLowerCase().includes(searchVal) ||
      record.first_name.toLowerCase().includes(searchVal) ||
      record.last_name.toLowerCase().includes(searchVal) ||
      record.passport.toLowerCase().includes(searchVal);

    // Status check: Compare active date with expiry date parameters
    let matchStatus = true;
    const recordExpiry = record.expiry_date.split("T")[0];

    if (statusVal === "VALID") {
      matchStatus = recordExpiry >= todayStr;
    } else if (statusVal === "EXPIRED") {
      matchStatus = recordExpiry < todayStr;
    }

    // Letter Type check
    const matchType = typeVal === "ALL" || record.certificate_title === typeVal;

    return matchSearch && matchStatus && matchType;
  });

  archiveCurrentPage = 1; // Return to page 1 on filter
  renderArchivePage();
}

// Table Renderer Engine
function renderArchivePage() {
  const tableBody = document.getElementById("recordsTableBody");
  const emptyState = document.getElementById("emptyState");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const paginationInfo = document.getElementById("paginationInfo");

  if (!tableBody) return;

  tableBody.innerHTML = "";
  const totalCount = filteredRecordsList.length;

  if (totalCount === 0) {
    tableBody.parentElement.parentElement.classList.add("hidden");
    emptyState.classList.remove("hidden");
    paginationInfo.textContent = "Showing 0 to 0 of 0 entries";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  tableBody.parentElement.parentElement.classList.remove("hidden");
  emptyState.classList.add("hidden");

  // Slice active index bounds based on pagination
  const startIdx = (archiveCurrentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalCount);
  const paginatedSlice = filteredRecordsList.slice(startIdx, endIdx);

  const todayStr = new Date().toISOString().split("T")[0];

  // Build row markers
  paginatedSlice.forEach((record) => {
    const isRecordValid = record.expiry_date.split("T")[0] >= todayStr;
    const statusBadge = isRecordValid
      ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">Valid</span>`
      : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-100">Expired</span>`;

    const row = document.createElement("tr");
    row.className = "hover:bg-slate-50/80 transition cursor-pointer group";
    // Clicking row opens this record directly in the sandbox modal
    row.onclick = () => loadRecordToSandbox(record);

    row.innerHTML = `
            <td class="py-4 px-6 font-semibold text-blue-600 font-mono text-xs group-hover:underline">${record.doc_id}</td>
            <td class="py-4 px-6 font-medium text-slate-800">${record.first_name} ${record.last_name}</td>
            <td class="py-4 px-6 text-slate-500 font-mono text-xs font-medium">${record.passport}</td>
            <td class="py-4 px-6 text-slate-600">${record.certificate_title}</td>
            <td class="py-4 px-6">${statusBadge}</td>
            <td class="py-4 px-6 text-right">
                <button class="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 py-1.5 px-3 rounded-lg transition shadow-sm">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Preview
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Update pagination descriptors
  paginationInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${totalCount} entries`;
  prevBtn.disabled = archiveCurrentPage === 1;
  nextBtn.disabled = endIdx >= totalCount;
}

// Pagination Controls
function prevPage() {
  if (archiveCurrentPage > 1) {
    archiveCurrentPage--;
    renderArchivePage();
  }
}

function nextPage() {
  const totalCount = filteredRecordsList.length;
  if (archiveCurrentPage * recordsPerPage < totalCount) {
    archiveCurrentPage++;
    renderArchivePage();
  }
}

// Loads selected database records directly into sandbox template & opens modal (Bypasses Review State)
function loadRecordToSandbox(record) {
  currentDocId = record.doc_id;
  currentRecord = record;
  isNewLetterGenerated = false; // Set to false so closing historical preview does not reload page

  // Synthesize verify URL for selected archive item
  const protocol =
    window.location.protocol === "https:" ? "https://" : "http://";
  currentVerifyUrl = `${protocol}${window.location.host}${window.location.pathname.replace("dashboard.php", "verify.php")}?doc_id=${currentDocId}`;

  // 1. Clone layout template into visual modal canvas
  const previewArea = document.getElementById("visualPreviewArea");
  const templateSrc = document.getElementById("pdfRenderingTemplate");

  if (previewArea && templateSrc) {
    const templateClone = templateSrc.cloneNode(true);
    templateClone.id = "clonedPdfTemplate";
    previewArea.innerHTML = "";
    previewArea.appendChild(templateClone);
  }

  // 2. Populate cloned version with permanent values
  populateTemplate(currentRecord, currentVerifyUrl);

  // 3. Forces Modal UI directly into POST-GENERATION TASK STATE (No review options shown)
  document.getElementById("modalHeaderReview").classList.add("hidden");
  document.getElementById("modalHeaderFinal").classList.remove("hidden");
  document.getElementById("panelReviewState").classList.add("hidden");
  document.getElementById("panelFinalState").classList.remove("hidden");

  const modalDocIdEl = document.getElementById("modalDocId");
  if (modalDocIdEl) modalDocIdEl.textContent = `Doc ID: ${currentDocId}`;

  openModal();
}
