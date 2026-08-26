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

// Updated: 5-Tab Visibility Switcher with strict structural checks
function switchTab(targetTab) {
  const panels = {
    generate: { panel: "tabPanelGenerate", btn: "tabBtnGenerate" },
    archive: { panel: "tabPanelArchive", btn: "tabBtnArchive" },
    email: { panel: "tabPanelEmail", btn: "tabBtnEmail" },
    upload: { panel: "tabPanelUpload", btn: "tabBtnUpload" },
    bulk: { panel: "tabPanelBulk", btn: "tabBtnBulk" }, // Holds the Tab E keys
  };

  // Safety check: Exit if the targeted tab key doesn't exist in config mapping
  if (!panels[targetTab]) {
    console.error(
      `Tab mapping for '${targetTab}' was not found inside assets/js/app.js.`,
    );
    return;
  }

  // Hide all panel content containers safely
  Object.keys(panels).forEach((key) => {
    const panelEl = document.getElementById(panels[key].panel);
    const btnEl = document.getElementById(panels[key].btn);

    if (panelEl) panelEl.classList.add("hidden");
    if (btnEl) {
      btnEl.className =
        "shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900";
    }
  });

  // Display selected panel content container safely
  const targetPanel = document.getElementById(panels[targetTab].panel);
  const targetBtn = document.getElementById(panels[targetTab].btn);

  if (targetPanel) targetPanel.classList.remove("hidden");
  if (targetBtn) {
    targetBtn.className =
      "shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg transition duration-150 bg-white text-slate-900 shadow-sm";
  }

  // Synchronize records dynamically into target dropdown lists
  if (targetTab === "archive") {
    renderArchivePage();
  } else if (targetTab === "email") {
    syncDropdownSelector("dispatcherLetterSelect");
  } else if (targetTab === "upload") {
    syncDropdownSelector("uploadLetterSelect");
  }
}

// Updated: Filtration logic now includes search strings, compliance, types, and target date ranges
function applyFilters() {
  const searchVal = document
    .getElementById("archiveSearch")
    .value.toLowerCase()
    .trim();
  const statusVal = document.getElementById("filterStatus").value;
  const typeVal = document.getElementById("filterType").value;

  // NEW: Calendar variables
  const dateVal = document.getElementById("filterDate").value; // Returns YYYY-MM-DD
  const dateRadioType = document.querySelector(
    'input[name="filterDateType"]:checked',
  ).value; // 'ISSUE' or 'EXPIRY'

  const todayStr = new Date().toISOString().split("T")[0];

  filteredRecordsList = activeRecordsList.filter((record) => {
    // Search check
    const matchSearch =
      !searchVal ||
      record.doc_id.toLowerCase().includes(searchVal) ||
      record.first_name.toLowerCase().includes(searchVal) ||
      record.last_name.toLowerCase().includes(searchVal) ||
      record.passport.toLowerCase().includes(searchVal);

    // Status check
    let matchStatus = true;
    const recordExpiry = record.expiry_date.split("T")[0];

    if (statusVal === "VALID") {
      matchStatus = recordExpiry >= todayStr;
    } else if (statusVal === "EXPIRED") {
      matchStatus = recordExpiry < todayStr;
    }

    // Letter Type check
    const matchType = typeVal === "ALL" || record.certificate_title === typeVal;

    // NEW: Calendar evaluation
    let matchDate = true;
    if (dateVal) {
      // Pick whether we evaluate the record's issue or expiry timestamp
      const recordTargetDate =
        dateRadioType === "ISSUE"
          ? record.issue_date.split("T")[0]
          : record.expiry_date.split("T")[0];
      matchDate = recordTargetDate === dateVal;
    }

    return matchSearch && matchStatus && matchType && matchDate;
  });

  archiveCurrentPage = 1; // Return to page 1 on filter reset
  renderArchivePage();
}

// Updated: Render function displays short-form abbreviations and new audit date columns
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

  const startIdx = (archiveCurrentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalCount);
  const paginatedSlice = filteredRecordsList.slice(startIdx, endIdx);

  const todayStr = new Date().toISOString().split("T")[0];

  // Mappings for compact space saving
  const typeAbbreviations = {
    "Appointment Letter": "AL",
    "Interview Letter": "IL",
    "Offer Letter": "OL",
  };

  paginatedSlice.forEach((record) => {
    const isRecordValid = record.expiry_date.split("T")[0] >= todayStr;
    const statusBadge = isRecordValid
      ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">Valid</span>`
      : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-100">Expired</span>`;

    // Retrieve shortened type tag
    const shortType = typeAbbreviations[record.certificate_title] || "LT";

    const row = document.createElement("tr");
    row.className = "hover:bg-slate-50/80 transition cursor-pointer group";
    row.onclick = () => loadRecordToSandbox(record);

    row.innerHTML = `
            <td class="py-4 px-6 font-semibold text-blue-600 font-mono text-xs group-hover:underline">${record.doc_id}</td>
            <td class="py-4 px-6 font-medium text-slate-800">${record.first_name} ${record.last_name}</td>
            <!-- Compact abbreviation wrapper with helpful browser tooltip on hover -->
            <td class="py-4 px-6 text-center">
                <span title="${record.certificate_title}" class="cursor-help inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition">
                    ${shortType}
                </span>
            </td>
            <!-- New: Audited Issue and Expiry Columns -->
            <td class="py-4 px-6 text-slate-500 font-medium text-xs">${formatDateLong(record.issue_date.split("T")[0])}</td>
            <td class="py-4 px-6 text-slate-500 font-medium text-xs">${formatDateLong(record.expiry_date.split("T")[0])}</td>
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

// Synchronizes actual database records into target <select> dropdown inputs
function syncDropdownSelector(dropdownId) {
  const selector = document.getElementById(dropdownId);
  if (!selector) return;

  // Reset dropdown container option states
  selector.innerHTML = '<option value="">Select a generated letter...</option>';

  // Loop through dynamic local database to append options
  activeRecordsList.forEach((record) => {
    const option = document.createElement("option");
    option.value = record.doc_id;
    option.textContent = `${record.doc_id} - ${record.first_name} ${record.last_name} (${record.certificate_title})`;
    selector.appendChild(option);
  });
}

// Auto-populates inputs inside the dispatcher panel based on selected Letter ID
function autoFillEmailRecipient() {
  const letterSelect = document.getElementById("dispatcherLetterSelect");
  const emailTo = document.getElementById("dispatcherTo");
  const emailSubject = document.getElementById("dispatcherSubject");
  const emailMessage = document.getElementById("dispatcherMessage");

  if (!letterSelect || !emailTo || !emailSubject || !emailMessage) return;

  const selectedDocId = letterSelect.value;
  const record = activeRecordsList.find((r) => r.doc_id === selectedDocId);

  if (record) {
    emailTo.value = record.email;
    emailSubject.value = `Official Document Statement - ${record.doc_id}`;
    emailMessage.value =
      `Dear ${record.first_name} ${record.last_name},\n\n` +
      `Please find the official registered statement details below:\n\n` +
      `- Letter Type: ${record.certificate_title}\n` +
      `- Reference ID: ${record.doc_id}\n` +
      `- Issuing Company: ${record.authority}\n\n` +
      `Verify document status here: http://${window.location.host}/verify.php?doc_id=${record.doc_id}\n\n` +
      `Best regards,\n` +
      `DocuVerify Secretariat Unit`;
  } else {
    emailTo.value = "";
    emailSubject.value = "";
    emailMessage.value = "";
  }
}

// Updates custom file input label elements with selected filenames on browse
function updateFileLabel(slotKey) {
  const fileInput = document.getElementById(`file_${slotKey}`);
  const fileLabel = document.getElementById(`label_${slotKey}`);

  if (fileInput && fileLabel) {
    if (fileInput.files.length > 0) {
      fileLabel.textContent = fileInput.files[0].name;
      fileLabel.className = "truncate pr-2 text-slate-800 font-semibold";
    } else {
      fileLabel.textContent = "Choose file...";
      fileLabel.className = "truncate pr-2 text-slate-400";
    }
  }
}

// Mock Email Dispatcher Handler (Frontend mock for Tab C)
function sendDispatcherEmail(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("dispatcherSubmitBtn");
  const btnText = document.getElementById("dispatcherBtnText");
  const spinner = document.getElementById("dispatcherSpinner");
  const status = document.getElementById("dispatcherEmailStatus");

  if (!submitBtn || !status) return;

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Dispatching...";
  status.className = "text-[10px] font-semibold text-blue-600 mt-2";
  status.textContent =
    "Connecting to SMTP relay server & compiling attachments...";
  status.classList.remove("hidden");

  setTimeout(() => {
    status.className = "text-[10px] font-semibold text-emerald-600 mt-2";
    status.textContent = "Transaction successfully executed. Email dispatched.";
    spinner.classList.add("hidden");
    btnText.textContent = "Dispatch Email";

    setTimeout(() => {
      document.getElementById("dispatcherEmailForm").reset();
      status.classList.add("hidden");
      submitBtn.disabled = false;
    }, 1500);
  }, 2000);
}

// Mock Supportive Document Upload Handler (Frontend mock for Tab D)
function uploadSupportiveDocs(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("uploadSubmitBtn");
  const btnText = document.getElementById("uploadBtnText");
  const spinner = document.getElementById("uploadSpinner");
  const status = document.getElementById("uploadStatus");

  if (!submitBtn || !status) return;

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Uploading Files...";
  status.className = "text-[10px] font-semibold text-blue-600 mt-2";
  status.textContent =
    "Uploading payload files to 'data/' folder & mapping references...";
  status.classList.remove("hidden");

  setTimeout(() => {
    status.className = "text-[10px] font-semibold text-emerald-600 mt-2";
    status.textContent =
      "Supportive credentials successfully associated and stored on server.";
    spinner.classList.add("hidden");
    btnText.textContent = "Upload Documents";

    setTimeout(() => {
      document.getElementById("supportiveDocsForm").reset();

      // Clear browse names
      ["passport", "national_id", "degree", "cv", "employment"].forEach(
        (key) => {
          const label = document.getElementById(`label_${key}`);
          if (label) {
            label.textContent = "Choose file...";
            label.className = "truncate pr-2 text-slate-400";
          }
        },
      );

      status.classList.add("hidden");
      submitBtn.disabled = false;
    }, 1500);
  }, 2000);
}

// Utility: Resets the calendar filter element
function clearDateFilter() {
  const calendar = document.getElementById("filterDate");
  if (calendar) {
    calendar.value = "";
    applyFilters();
  }
}

// ==========================================
// DRAG-TO-SCROLL HORIZONTAL SELECTOR ENGINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("scrollableTabSelector");
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Mouse Down - User grabs the container
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  // Mouse Leave - User moves pointer outside boundaries
  slider.addEventListener("mouseleave", () => {
    isDown = false;
  });

  // Mouse Up - User releases the grab
  slider.addEventListener("mouseup", () => {
    isDown = false;
  });

  // Mouse Move - Executes horizontal page scroll based on grab momentum
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault(); // Prevents highlight selection bugs during drag

    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.8; // Scroll multiplier speed
    slider.scrollLeft = scrollLeft - walk;
  });
});

// Updated: 5-Tab Visibility Switcher
function switchTab(targetTab) {
  const panels = {
    generate: { panel: "tabPanelGenerate", btn: "tabBtnGenerate" },
    archive: { panel: "tabPanelArchive", btn: "tabBtnArchive" },
    email: { panel: "tabPanelEmail", btn: "tabBtnEmail" },
    upload: { panel: "tabPanelUpload", btn: "tabBtnUpload" },
    bulk: { panel: "tabPanelBulk", btn: "tabBtnBulk" }, // NEW: Tab E
  };

  Object.keys(panels).forEach((key) => {
    document.getElementById(panels[key].panel).classList.add("hidden");
    document.getElementById(panels[key].btn).className =
      "shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900";
  });

  document.getElementById(panels[targetTab].panel).classList.remove("hidden");
  document.getElementById(panels[targetTab].btn).className =
    "shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg transition duration-150 bg-white text-slate-900 shadow-sm";

  if (targetTab === "archive") {
    renderArchivePage();
  } else if (targetTab === "email") {
    syncDropdownSelector("dispatcherLetterSelect");
  } else if (targetTab === "upload") {
    syncDropdownSelector("uploadLetterSelect");
  }
}

// ==========================================
// CLIENT-SIDE CSV PARSER & BULK GENERATOR
// ==========================================

let bulkQueueRecords = [];
let activeCSVFilename = "";

// Drag & Drop visual state helpers
function handleDragOver(e) {
  e.preventDefault();
  document
    .getElementById("dropZone")
    .classList.add("border-blue-500", "bg-blue-50/20");
}

function handleDragLeave(e) {
  e.preventDefault();
  document
    .getElementById("dropZone")
    .classList.remove("border-blue-500", "bg-blue-50/20");
}

// Updated: Saves active file name during drop
function handleFileDrop(e) {
  e.preventDefault();
  handleDragLeave(e);
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].name.endsWith(".csv")) {
    activeCSVFilename = files[0].name; // Save filename reference
    parseCSV(files[0]);
  } else {
    alert("Please drop a valid .csv file.");
  }
}

// Updated: Saves active file name during selection
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    activeCSVFilename = files[0].name; // Save filename reference
    parseCSV(files[0]);
  }
}

// Client-Side CSV Parser Engine
function parseCSV(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);

    bulkQueueRecords = []; // Reset queue
    if (lines.length <= 1) {
      alert("The selected file is empty or missing headers.");
      return;
    }

    // Headers expected: first_name,last_name,nationality,passport,dob,designation,phone,email,certificate_title,authority,timezone
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^["']|["']$/g, ""));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""));
      if (values.length < headers.length) continue;

      // Map keys dynamically
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // Fallbacks for date formatting validation
      if (!record.issue_date)
        record.issue_date = new Date().toISOString().slice(0, 16);
      if (!record.expiry_date)
        record.expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16);
      if (!record.timezone) record.timezone = "UTC";

      // Map designations to salaries automatically
      record.salary = designationSalaries[record.designation] || "$0.00";

      bulkQueueRecords.push(record);
    }

    renderBulkQueueTable();
  };
  reader.readAsText(file);
}

// Updated: Shows simple, clean confirmation summary instead of a detailed table (Way 1)
function renderBulkQueueTable() {
  const queueCard = document.getElementById("bulkQueueCard");
  const queueTitle = document.getElementById("bulkQueueTitle");
  const queueMsg = document.getElementById("bulkQueueMessage");

  if (!queueCard || !queueTitle || !queueMsg) return;

  queueTitle.textContent = `Spreadsheet Parsed Successfully`;
  queueMsg.textContent = `Ready to compile ${bulkQueueRecords.length} letters imported from your file "${activeCSVFilename}". Click "Generate All Letters" to execute.`;

  queueCard.classList.remove("hidden");
}

// Bulk queue checking triggers
function toggleAllBulkQueue(source) {
  const checkboxes = document.querySelectorAll('input[name="bulkQueueCheck"]');
  checkboxes.forEach((cb) => (cb.checked = source.checked));
}

function clearBulkQueue() {
  bulkQueueRecords = [];
  document.getElementById("bulkQueueCard").classList.add("hidden");
  document.getElementById("csvFileInput").value = "";
}

// Exporter: Direct browser-side templated CSV generation download
function downloadCsvTemplate() {
  const headers =
    "first_name,last_name,nationality,passport,dob,designation,phone,email,certificate_title,authority,timezone\n";
  const sampleRows =
    "Sadullah,Yoosuf,Singapore,S8557710,2000-07-12,Software Engineer,+1234567890,recipient@domain.com,Appointment Letter,EGC,SGT\n" +
    "John,Doe,United States,A9876543,1992-05-15,Project Manager,+1987654321,manager@domain.com,Interview Letter,DocuVerify Unit,EST\n";

  const blob = new Blob([headers + sampleRows], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "docuverify_bulk_template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Updated: Generates letters automatically for ALL parsed CSV rows (Way 1)
async function generateBulkQueue() {
  if (bulkQueueRecords.length === 0) {
    alert("No records discovered to generate.");
    return;
  }

  const compileBtn = document.getElementById("bulkCompileBtn");
  const progressWrapper = document.getElementById("bulkProgressWrapper");
  const progressBar = document.getElementById("progressBar");
  const progressPct = document.getElementById("progressPct");
  const progressText = document.getElementById("progressText");

  compileBtn.disabled = true;
  progressWrapper.classList.remove("hidden");

  let processedCount = 0;
  const totalToProcess = bulkQueueRecords.length; // Compiles all parsed records automatically

  // Loop through all parsed records sequentially
  for (let idx = 0; idx < totalToProcess; idx++) {
    const record = bulkQueueRecords[idx];
    progressText.textContent = `Compiling ${processedCount + 1} of ${totalToProcess}: ${record.first_name} ${record.last_name}`;

    // Construct standard POST payload
    const payload = new FormData();
    Object.keys(record).forEach((key) => {
      payload.append(key, record[key]);
    });

    try {
      const response = await fetch("generate_pdf.php", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) throw new Error("Connection failed");

      const resData = await response.json();
      if (resData.status !== "success") throw new Error(resData.message);

      processedCount++;
      const percentComplete = Math.round(
        (processedCount / totalToProcess) * 100,
      );
      progressBar.style.width = `${percentComplete}%`;
      progressPct.textContent = `${percentComplete}%`;
    } catch (err) {
      console.error(`Bulk generation error on row indices ${idx}:`, err);
    }
  }

  progressText.textContent = "Bulk generation completed successfully.";

  setTimeout(() => {
    isNewLetterGenerated = true;
    window.location.reload();
  }, 1500);
}

// ==========================================
// WAY 2: STAGING DATABASE QUEUE CONTROLLER
// ==========================================

let activeStagingDatabaseList = [];

// Initialize Staging list on page load
document.addEventListener("DOMContentLoaded", () => {
  if (typeof databaseInjectedStaged !== "undefined") {
    activeStagingDatabaseList = databaseInjectedStaged;
  }
  renderStagingTable();
  toggleWorkflowUI();
});

// Controls visibility toggles based on active workflow radio selection
function toggleWorkflowUI() {
  const workflowVal = document.querySelector(
    'input[name="bulkWorkflowType"]:checked',
  ).value;
  const directCard = document.getElementById("bulkQueueCard");
  const stagingCard = document.getElementById("stagingConsoleCard");

  if (workflowVal === "DIRECT") {
    // Direct Instant compiles
    stagingCard.classList.add("hidden");
    if (bulkQueueRecords.length > 0) {
      directCard.classList.remove("hidden");
    }
  } else {
    // Staged compilation flow
    directCard.classList.add("hidden");
    stagingCard.classList.remove("hidden");
  }
}

// Intercepts file select to route based on selected Workflow Mode
function parseCSV(file) {
  const workflowVal = document.querySelector(
    'input[name="bulkWorkflowType"]:checked',
  ).value;

  if (workflowVal === "DIRECT") {
    // Route to Way 1: Direct compile
    executeDirectParser(file);
  } else {
    // Route to Way 2: Upload to Staging Area
    executeStagingParser(file);
  }
}

// Way 1 Parser Engine
function executeDirectParser(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);

    bulkQueueRecords = [];
    if (lines.length <= 1) return;

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^["']|["']$/g, ""));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""));
      if (values.length < headers.length) continue;

      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      if (!record.issue_date)
        record.issue_date = new Date().toISOString().slice(0, 16);
      if (!record.expiry_date)
        record.expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16);
      if (!record.timezone) record.timezone = "UTC";
      record.salary = designationSalaries[record.designation] || "$0.00";

      bulkQueueRecords.push(record);
    }
    renderBulkQueueTable();
  };
  reader.readAsText(file);
}

// Way 2 Parser Engine: Upload & Save raw records to Staging Database
async function executeStagingParser(file) {
  const reader = new FileReader();
  reader.onload = async function (e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);

    const tempRecordsList = [];
    if (lines.length <= 1) return;

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^["']|["']$/g, ""));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""));
      if (values.length < headers.length) continue;

      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // Set import timestamps
      record.imported_at = new Date().toLocaleDateString("en-GB");
      tempRecordsList.push(record);
    }

    // Send raw imported arrays to a temporary mock DB writer
    // This simulates uploading and appending rows directly into our staging DB
    activeStagingDatabaseList = [
      ...activeStagingDatabaseList,
      ...tempRecordsList,
    ];
    renderStagingTable();
    alert(
      `${tempRecordsList.length} profile records successfully imported to the Staging Database.`,
    );
  };
  reader.readAsText(file);
}

// Renders Way 2 Staging Table console
function renderStagingTable() {
  const tableBody = document.getElementById("stagingQueueTableBody");
  const countBadge = document.getElementById("stagingCountBadge");

  if (!tableBody) return;
  tableBody.innerHTML = "";

  countBadge.textContent = `${activeStagingDatabaseList.length} Staged Records`;

  activeStagingDatabaseList.forEach((record, idx) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-slate-50 transition";
    row.innerHTML = `
            <td class="py-3 px-6 text-center"><input type="checkbox" name="stagingQueueCheck" value="${idx}" checked class="w-3.5 h-3.5 text-amber-600 rounded"></td>
            <td class="py-3 px-6 font-semibold text-slate-800">${record.first_name} ${record.last_name}</td>
            <td class="py-3 px-6 font-mono font-medium">${record.passport}</td>
            <td class="py-3 px-6">${record.designation}</td>
            <td class="py-3 px-6"><span class="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">${record.certificate_title === "Appointment Letter" ? "AL" : "IL"}</span></td>
            <td class="py-3 px-6 text-slate-400 font-medium">${record.imported_at || "Just Now"}</td>
        `;
    tableBody.appendChild(row);
  });

  document.getElementById("stagingSelectAll").checked = true;
}

// Staging selection triggers
function toggleAllStagingQueue(source) {
  const checkboxes = document.querySelectorAll(
    'input[name="stagingQueueCheck"]',
  );
  checkboxes.forEach((cb) => (cb.checked = source.checked));
}

function clearStagingDatabase() {
  if (
    confirm(
      "Are you sure you want to flush all records from the Staging Database?",
    )
  ) {
    activeStagingDatabaseList = [];
    renderStagingTable();
  }
}

// Generates selected staged elements
async function generateFromStagingArea() {
  const checkboxes = document.querySelectorAll(
    'input[name="stagingQueueCheck"]:checked',
  );
  const selectedIndices = Array.from(checkboxes).map((cb) =>
    parseInt(cb.value),
  );

  if (selectedIndices.length === 0) {
    alert("Please select at least one staged record to compile.");
    return;
  }

  const compileBtn = document.getElementById("stagingCompileBtn");
  const progressWrapper = document.getElementById("stagingProgressWrapper");
  const progressBar = document.getElementById("stagingProgressBar");
  const progressPct = document.getElementById("stagingProgressPct");
  const progressText = document.getElementById("stagingProgressText");

  compileBtn.disabled = true;
  progressWrapper.classList.remove("hidden");

  let processedCount = 0;
  const totalToProcess = selectedIndices.length;

  // Compile loop runs sequentially to generate records on the fly
  for (const idx of selectedIndices) {
    const record = activeStagingDatabaseList[idx];
    progressText.textContent = `Compiling ${processedCount + 1} of ${totalToProcess}: ${record.first_name} ${record.last_name}`;

    // Map salary and timestamps on the fly
    if (!record.issue_date)
      record.issue_date = new Date().toISOString().slice(0, 16);
    if (!record.expiry_date)
      record.expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);
    if (!record.timezone) record.timezone = "UTC";
    record.salary = designationSalaries[record.designation] || "$0.00";

    const payload = new FormData();
    Object.keys(record).forEach((key) => {
      payload.append(key, record[key]);
    });

    try {
      const response = await fetch("generate_pdf.php", {
        method: "POST",
        body: payload,
      });
      if (!response.ok) throw new Error("Connection failed");
      const resData = await response.json();
      if (resData.status !== "success") throw new Error(resData.message);

      processedCount++;
      const percentComplete = Math.round(
        (processedCount / totalToProcess) * 100,
      );
      progressBar.style.width = `${percentComplete}%`;
      progressPct.textContent = `${percentComplete}%`;
    } catch (err) {
      console.error(`Compilation error on staged index ${idx}:`, err);
    }
  }

  // Clean compile entries out of staging database list
  // This removes successful generations from staging area automatically
  activeStagingDatabaseList = activeStagingDatabaseList.filter(
    (_, index) => !selectedIndices.includes(index),
  );

  progressText.textContent = "Selected staged records compiled successfully.";

  setTimeout(() => {
    isNewLetterGenerated = true;
    window.location.reload();
  }, 1500);
}
