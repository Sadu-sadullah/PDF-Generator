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

// Submit Listener: Validates data, then loads draft preview (No server write yet)
document
  .getElementById("certificateForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Reset previous validation errors
    const inputs = this.querySelectorAll("input, select");
    inputs.forEach((input) => clearFieldError(input));

    let isFormValid = true;

    // 1. Validate First & Last Name (Alphabetical characters, spaces, and hyphens only, min 2 chars)
    const firstName = this.querySelector('input[name="first_name"]');
    const lastName = this.querySelector('input[name="last_name"]');
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;

    if (!nameRegex.test(firstName.value.trim())) {
      showFieldError(
        firstName,
        "Please enter a valid first name (minimum 2 letters, alphabetic only).",
      );
      isFormValid = false;
    }
    if (!nameRegex.test(lastName.value.trim())) {
      showFieldError(
        lastName,
        "Please enter a valid last name (minimum 2 letters, alphabetic only).",
      );
      isFormValid = false;
    }

    // 2. Validate Passport/ID (Alphanumeric only, must be between 6 and 15 characters)
    const passport = this.querySelector('input[name="passport"]');
    const passportRegex = /^[a-zA-Z0-9]{6,15}$/;
    if (!passportRegex.test(passport.value.trim())) {
      showFieldError(
        passport,
        "Passport must be alphanumeric and between 6 and 15 characters long.",
      );
      isFormValid = false;
    }

    // 3. Validate Date of Birth (Must be a date in the past)
    const dob = this.querySelector('input[name="dob"]');
    const dobDate = new Date(dob.value);
    const today = new Date();
    if (isNaN(dobDate.getTime()) || dobDate >= today) {
      showFieldError(dob, "Date of birth must be a valid date in the past.");
      isFormValid = false;
    }

    // 4. Validate International Phone Number (Must start with '+' followed by 7 to 15 digits)
    const phone = this.querySelector('input[name="phone"]');
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(phone.value.trim())) {
      showFieldError(
        phone,
        "Please enter a valid phone number with country code (e.g., +12345678900).",
      );
      isFormValid = false;
    }

    // 5. Validate Email Address (Syntax check)
    const email = this.querySelector('input[name="email"]');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.value.trim())) {
      showFieldError(email, "Please enter a valid email address.");
      isFormValid = false;
    }

    // 6. Validate Expiry Date (Must be set later than the Issue Date)
    const issueDate = this.querySelector('input[name="issue_date"]');
    const expiryDate = this.querySelector('input[name="expiry_date"]');
    const issueTime = new Date(issueDate.value);
    const expiryTime = new Date(expiryDate.value);

    if (issueTime >= expiryTime) {
      showFieldError(
        expiryDate,
        "The expiry date & time must be set later than the issue date & time.",
      );
      isFormValid = false;
    }

    // Halt submission if any validation fails
    if (!isFormValid) {
      const firstError = this.querySelector(".border-red-500");
      if (firstError)
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // --- FORM IS VALID: Proceed with draft compilation preview ---
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

    const previewArea = document.getElementById("visualPreviewArea");
    const templateSrc = document.getElementById("pdfRenderingTemplate");

    if (previewArea && templateSrc) {
      const templateClone = templateSrc.cloneNode(true);
      templateClone.id = "clonedPdfTemplate";
      previewArea.innerHTML = "";
      previewArea.appendChild(templateClone);
    }

    const draftVerifyUrl =
      "https://your-domain.com/verify.php?doc_id=DRAFT-PREVIEW";
    populateTemplate(draftRecord, draftVerifyUrl);

    document.getElementById("modalHeaderReview").classList.remove("hidden");
    document.getElementById("modalHeaderFinal").classList.add("hidden");
    document.getElementById("panelReviewState").classList.remove("hidden");
    document.getElementById("panelFinalState").classList.add("hidden");

    const modalDocIdEl = document.getElementById("modalDocId");
    if (modalDocIdEl) {
      modalDocIdEl.textContent = "Doc ID: DRAFT-PREVIEW";
    }

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

  // NEW: Instantly initializes the tab bar on load to apply correct styling and icons immediately
  switchTab("generate");
});

// Corrected: Fully integrated 5-tab visibility, standard-padding, and dynamic Font Awesome icon switcher
function switchTab(targetTab) {
  const panels = {
    generate: {
      panel: "tabPanelGenerate",
      btn: "tabBtnGenerate",
      icon: "fa-file-circle-plus",
      activeColor: "text-blue-600",
    },
    archive: {
      panel: "tabPanelArchive",
      btn: "tabBtnArchive",
      icon: "fa-box-archive",
      activeColor: "text-amber-500",
    },
    email: {
      panel: "tabPanelEmail",
      btn: "tabBtnEmail",
      icon: "fa-paper-plane",
      activeColor: "text-emerald-500",
    },
    upload: {
      panel: "tabPanelUpload",
      btn: "tabBtnUpload",
      icon: "fa-folder-open",
      activeColor: "text-purple-500",
    },
    bulk: {
      panel: "tabPanelBulk",
      btn: "tabBtnBulk",
      icon: "fa-layer-group",
      activeColor: "text-indigo-500",
    },
  };

  if (!panels[targetTab]) {
    console.error(
      `Tab mapping for '${targetTab}' was not found inside assets/js/app.js.`,
    );
    return;
  }

  // 1. Hide all panel content containers & reset all buttons to standard px-5 py-3 inactive state
  Object.keys(panels).forEach((key) => {
    const panelEl = document.getElementById(panels[key].panel);
    const btnEl = document.getElementById(panels[key].btn);

    if (panelEl) panelEl.classList.add("hidden");
    if (btnEl) {
      // Apply standard inactive padding and text colors
      btnEl.className =
        "shrink-0 px-5 py-3 text-xs font-bold rounded-xl transition duration-150 text-slate-600 hover:text-slate-900 flex items-center";
      // Render icon in its default muted slate gray color
      btnEl.innerHTML = `<i class="fa-solid ${panels[key].icon} text-slate-400 mr-2 text-sm"></i>${btnEl.textContent.trim()}`;
    }
  });

  // 2. Display selected panel container & apply standard px-5 py-3 active state
  const targetPanel = document.getElementById(panels[targetTab].panel);
  const targetBtn = document.getElementById(panels[targetTab].btn);

  if (targetPanel) targetPanel.classList.remove("hidden");
  if (targetBtn) {
    // Apply standard active white background & dark text padding
    targetBtn.className =
      "shrink-0 px-5 py-3 text-xs font-bold rounded-xl transition duration-150 bg-white text-slate-900 shadow-sm flex items-center";
    // Render icon in its bright, pulsating active color
    targetBtn.innerHTML = `<i class="fa-solid ${panels[targetTab].icon} ${panels[targetTab].activeColor} mr-2 text-sm animate-pulse"></i>${targetBtn.textContent.trim()}`;
  }

  // 3. Synchronize records dynamically into target dropdown lists
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

// Corrected: Safely splits and formats dates even if records contain null/empty values (Prevents page-load crashes)
function renderArchivePage() {
  const tableBody = document.getElementById("recordsTableBody");
  const emptyState = document.getElementById("emptyState");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const paginationInfo = document.getElementById("paginationInfo");

  if (!tableBody) return;

  // --- NEW: Dynamic Metrics Calculations ---
  const todayStr = new Date().toISOString().split("T")[0];
  let activeCount = 0;
  let expiredCount = 0;

  activeRecordsList.forEach((r) => {
    const expiryDatePart = r.expiry_date ? r.expiry_date.split("T")[0] : "";
    if (expiryDatePart && expiryDatePart >= todayStr) {
      activeCount++;
    } else {
      expiredCount++;
    }
  });

  // Populate Widget text nodes safely
  const wTotal = document.getElementById("widgetTotalCount");
  const wActive = document.getElementById("widgetActiveCount");
  const wExpired = document.getElementById("widgetExpiredCount");

  if (wTotal) wTotal.textContent = activeRecordsList.length;
  if (wActive) wActive.textContent = activeCount;
  if (wExpired) wExpired.textContent = expiredCount;

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

  const typeAbbreviations = {
    "Appointment Letter": "AL",
    "Interview Letter": "IL",
    "Offer Letter": "OL",
  };

  paginatedSlice.forEach((record) => {
    // Safe Date Splitting: Verifies dates exist before splitting to prevent page crashes
    const issueDatePart = record.issue_date
      ? record.issue_date.split("T")[0]
      : "";
    const expiryDatePart = record.expiry_date
      ? record.expiry_date.split("T")[0]
      : "";

    const isRecordValid = expiryDatePart ? expiryDatePart >= todayStr : false;
    const statusBadge = isRecordValid
      ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">Valid</span>`
      : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-100">Expired</span>`;

    const shortType = typeAbbreviations[record.certificate_title] || "LT";

    const row = document.createElement("tr");
    row.className = "hover:bg-slate-50/80 transition cursor-pointer group";
    row.onclick = () => loadRecordToSandbox(record);

    row.innerHTML = `
            <td class="py-4 px-6 text-center" onclick="event.stopPropagation()">
                <input type="checkbox" name="archiveCheck" value="${record.doc_id}" checked class="w-3.5 h-3.5 text-blue-600 rounded">
            </td>
            <td class="py-4 px-6 font-semibold text-blue-600 font-mono text-xs group-hover:underline">${record.doc_id}</td>
            <td class="py-4 px-6 font-medium text-slate-800">${record.first_name} ${record.last_name}</td>
            <td class="py-4 px-6 text-center">
                <span title="${record.certificate_title}" class="cursor-help inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition">
                    ${shortType}
                </span>
            </td>
            <!-- Safe output rendering: Displays placeholder if date values are null in database -->
            <td class="py-4 px-6 text-slate-500 font-medium text-xs">${issueDatePart ? formatDateLong(issueDatePart) : "---"}</td>
            <td class="py-4 px-6 text-slate-500 font-medium text-xs">${expiryDatePart ? formatDateLong(expiryDatePart) : "---"}</td>
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

// Updated: Dropdown sync engine with diagnostic alerts
function syncDropdownSelector(dropdownId) {
  const selector = document.getElementById(dropdownId);

  // Diagnostic Alert: If the element doesn't exist in the HTML, log it clearly in the F12 Console
  if (!selector) {
    console.error(
      `CRITICAL: Selector element with ID "${dropdownId}" was not found in your dashboard.php DOM. Check for typos.`,
    );
    return;
  }

  selector.innerHTML = '<option value="">Select a generated letter...</option>';

  if (activeRecordsList.length === 0) {
    console.warn("Database records array is empty inside JS scope.");
  }

  activeRecordsList.forEach((record) => {
    const option = document.createElement("option");
    option.value = record.doc_id;
    option.textContent = `${record.doc_id} - ${record.first_name} ${record.last_name} (${record.certificate_title})`;
    selector.appendChild(option);
  });

  if (dropdownId === "uploadLetterSelect") {
    selector.onchange = updateUploadStatusFields;
    // Run status updater immediately to reset badges to 'Pending' on render
    updateUploadStatusFields();
  }
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

// Operational System Email Dispatcher (Compiles PDF on the fly and uploads via AJAX)
async function sendDispatcherEmail(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("dispatcherSubmitBtn");
  const btnText = document.getElementById("dispatcherBtnText");
  const spinner = document.getElementById("dispatcherSpinner");
  const status = document.getElementById("dispatcherEmailStatus");

  const selectedDocId = document.getElementById("dispatcherLetterSelect").value;
  const recipient = document.getElementById("dispatcherTo").value;
  const subject = document.getElementById("dispatcherSubject").value;
  const message = document.getElementById("dispatcherMessage").value;
  const attachPdf = document.getElementById("dispatcherAttachCheck").checked;

  if (!selectedDocId || !recipient || !status) {
    alert("Please select a letter and fill in recipient details.");
    return;
  }

  // UI Loading State
  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Compiling & Sending...";
  status.className = "text-[10px] font-semibold text-blue-600 mt-2";
  status.textContent = "Compiling letter to PDF binary blob on the fly...";
  status.classList.remove("hidden");

  try {
    const formData = new FormData();
    formData.append("email", recipient);
    formData.append("subject", subject);
    formData.append("message", message);
    formData.append("doc_id", selectedDocId);

    if (attachPdf) {
      // Find the record object in your local memory array
      const record = activeRecordsList.find((r) => r.doc_id === selectedDocId);
      const protocol =
        window.location.protocol === "https:" ? "https://" : "http://";
      const verifyUrl = `${protocol}${window.location.host}${window.location.pathname.replace("dashboard.php", "verify.php")}?doc_id=${selectedDocId}`;

      // Instantly map values into hidden rendering template before compile
      populateTemplate(record, verifyUrl);

      const element = document.getElementById("pdfRenderingTemplate");
      if (!element) throw new Error("PDF compilation template was not found.");

      // Render PDF as binary Blob in background
      const pdfBlob = await html2pdf()
        .set(getHtml2PdfOptions())
        .from(element)
        .outputPdf("blob");

      // Append PDF file payload to multipart form
      formData.append("pdf_file", pdfBlob, `letter_${selectedDocId}.pdf`);
    }

    status.textContent =
      "Connecting to SMTP relay server and routing payload...";

    // Post payload to backend mail agent
    const response = await fetch("send_email.php", {
      method: "POST",
      body: formData,
    });

    // Get raw text output (crucial to capture PHP error messages or debug handshakes)
    const rawResponseText = await response.text();

    // Parse JSON payload
    const resData = JSON.parse(rawResponseText);

    if (resData.status === "success") {
      status.className = "text-[10px] font-semibold text-emerald-600 mt-2";
      status.textContent =
        resData.message || "Email successfully dispatched with attachment.";

      // Clear composer form on success after short delay
      setTimeout(() => {
        document.getElementById("dispatcherEmailForm").reset();
        status.classList.add("hidden");
        submitBtn.disabled = false;
      }, 2000);
    } else {
      status.className = "text-[10px] font-semibold text-red-500 mt-2";
      status.textContent =
        resData.message || "Server rejected dispatch command.";
      submitBtn.disabled = false;
    }
  } catch (err) {
    console.error("Email dispatcher failed:", err);
    status.className = "text-[10px] font-semibold text-red-500 mt-2";

    // If PHP output contains debug logs, the JSON parser will fail and alert the logs directly
    status.textContent = "SMTP Handshake Error: " + err.message;
    alert("SMTP Debug Output:\n" + (rawResponseText || err.message));
    submitBtn.disabled = false;
  } finally {
    spinner.classList.add("hidden");
    btnText.textContent = "Dispatch Email";
  }
}

// Operational Supportive Document Uploader (Submits multipart/form-data via AJAX)
async function uploadSupportiveDocs(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("uploadSubmitBtn");
  const btnText = document.getElementById("uploadBtnText");
  const spinner = document.getElementById("uploadSpinner");
  const status = document.getElementById("uploadStatus");

  const form = document.getElementById("supportiveDocsForm");
  if (!form || !submitBtn || !status) return;

  // UI Loading state
  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Uploading...";
  status.className = "text-[10px] font-semibold text-blue-600 mt-2";
  status.textContent =
    "Uploading payload files to 'data/' folder & updating database...";
  status.classList.remove("hidden");

  const formData = new FormData(form);

  try {
    const response = await fetch("upload_docs.php", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      status.className = "text-[10px] font-semibold text-emerald-600 mt-2";
      status.textContent = data.message || "Files successfully uploaded.";

      isNewLetterGenerated = true; // Set to true so page reloads on modal close to refresh dataset

      setTimeout(() => {
        form.reset();
        status.classList.add("hidden");
        submitBtn.disabled = false;
        window.location.reload(); // Reload to refresh local records cache
      }, 1500);
    } else {
      status.className = "text-[10px] font-semibold text-red-500 mt-2";
      status.textContent = data.message || "Upload failed.";
      submitBtn.disabled = false;
    }
  } catch (err) {
    console.error("File upload failed:", err);
    status.className = "text-[10px] font-semibold text-red-500 mt-2";
    status.textContent = "Error: " + err.message;
    submitBtn.disabled = false;
  } finally {
    spinner.classList.add("hidden");
    btnText.textContent = "Upload Documents";
  }
}

// Utility: Resets the calendar filter element
function clearDateFilter() {
  const calendar = document.getElementById("filterDate");
  if (calendar) {
    calendar.value = "";
    applyFilters();
  }
}

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

// ==========================================
// FORM FIELD VALIDATION VISUAL HELPERS
// ==========================================

// Inserts visual error outline and error text directly below invalid input element
function showFieldError(inputEl, message) {
  clearFieldError(inputEl); // Reset previous error if existing

  // Apply red border indicators
  inputEl.classList.add(
    "border-red-500",
    "focus:ring-red-500",
    "focus:border-red-500",
  );
  inputEl.classList.remove("border-slate-200", "focus:ring-blue-500");

  // Create helper error text block
  const errText = document.createElement("p");
  errText.className =
    "text-red-500 text-[10px] font-semibold mt-1 field-error-text";
  errText.textContent = message;

  // Append directly below the input element
  inputEl.parentNode.appendChild(errText);
}

// Clears visual error highlights and removes text block
function clearFieldError(inputEl) {
  inputEl.classList.remove(
    "border-red-500",
    "focus:ring-red-500",
    "focus:border-red-500",
  );
  inputEl.classList.add("border-slate-200", "focus:ring-blue-500");

  const parent = inputEl.parentNode;
  const existingErr = parent.querySelector(".field-error-text");
  if (existingErr) {
    parent.removeChild(existingErr);
  }
}

// ==========================================
// ARCHIVE SELECTION & CSV EXPORTER MODULES
// ==========================================

// Master Toggle: Checked state on header box replicates on all rows
function toggleAllArchive(source) {
  const checkboxes = document.querySelectorAll('input[name="archiveCheck"]');
  checkboxes.forEach((cb) => (cb.checked = source.checked));
}

// Client-Side CSV Transpilation Engine
function convertArrayToCSV(recordsArray) {
  const headers =
    "doc_id,first_name,last_name,nationality,passport,dob,designation,salary,phone,email,certificate_title,issue_date,expiry_date,authority,timezone,generated_at\n";

  const rows = recordsArray
    .map((r) => {
      // Enforce safe CSV text escaping on string values containing commas
      const values = [
        r.doc_id,
        `"${r.first_name.replace(/"/g, '""')}"`,
        `"${r.last_name.replace(/"/g, '""')}"`,
        r.nationality,
        r.passport,
        r.dob,
        `"${r.designation.replace(/"/g, '""')}"`,
        `"${r.salary.replace(/"/g, '""')}"`,
        r.phone,
        r.email,
        `"${r.certificate_title.replace(/"/g, '""')}"`,
        r.issue_date,
        r.expiry_date,
        `"${r.authority.replace(/"/g, '""')}"`,
        r.timezone,
        r.generated_at || "",
      ];
      return values.join(",");
    })
    .join("\n");

  return headers + rows;
}

// Exports only rows matching checked checkboxes in active pagination viewport
function exportSelectedLetters() {
  const checkboxes = document.querySelectorAll(
    'input[name="archiveCheck"]:checked',
  );
  const selectedDocIds = Array.from(checkboxes).map((cb) => cb.value);

  if (selectedDocIds.length === 0) {
    alert("Please select at least one record from the list to export.");
    return;
  }

  // Filter matching objects out of local memory list
  const selectedRecords = activeRecordsList.filter((r) =>
    selectedDocIds.includes(r.doc_id),
  );
  const csvContent = convertArrayToCSV(selectedRecords);

  triggerCSVFileDownload(
    csvContent,
    `selected_registry_letters_${new Date().toISOString().split("T")[0]}.csv`,
  );
}

// Exports full database entries
function exportAllLetters() {
  if (activeRecordsList.length === 0) {
    alert("No letter records discovered in system registry to export.");
    return;
  }

  const csvContent = convertArrayToCSV(activeRecordsList);
  triggerCSVFileDownload(
    csvContent,
    `full_letters_registry_export_${new Date().toISOString().split("T")[0]}.csv`,
  );
}

// Client-Side download click router
function triggerCSVFileDownload(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Updated: Queries local database parameters to toggle UI Status Badges, View Links, and Delete Buttons
function updateUploadStatusFields() {
  const selector = document.getElementById("uploadLetterSelect");
  if (!selector) return;

  const selectedDocId = selector.value;
  const record = activeRecordsList.find((r) => r.doc_id === selectedDocId);

  const slots = ["passport", "national_id", "degree", "cv", "employment"];

  slots.forEach((slot) => {
    const statusBadge = document.getElementById(`status_${slot}`);
    const fileLabel = document.getElementById(`label_${slot}`);
    const actionSpan = document.getElementById(`action_${slot}`);

    if (!statusBadge || !fileLabel || !actionSpan) return;

    const dbColumnKey = `file_${slot}`;
    const filePath = record ? record[dbColumnKey] : null;

    if (filePath) {
      // Update badge to GREEN: Uploaded
      statusBadge.className =
        "text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100";
      statusBadge.textContent = "Uploaded";

      // Turn the left label into an interactive preview link
      fileLabel.innerHTML = `
                <a href="${filePath}" target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-semibold" onclick="event.stopPropagation()">
                    <svg class="w-3.5 h-3.5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    View Uploaded File
                </a>
            `;

      // NEW: Replace "Browse" on the right with a red "Delete" action button
      // event.preventDefault() and event.stopPropagation() prevent the click from opening the browse file explorer
      actionSpan.innerHTML = `
                <button type="button" onclick="event.preventDefault(); event.stopPropagation(); deleteSupportiveDoc('${slot}')" class="text-red-500 hover:text-red-700 font-bold shrink-0 focus:outline-none">
                    Delete
                </button>
            `;
      actionSpan.className = "shrink-0";
    } else {
      // Update badge to AMBER: Pending
      statusBadge.className =
        "text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100";
      statusBadge.textContent = "Pending";

      fileLabel.textContent = "Choose file...";
      fileLabel.className = "truncate pr-2 text-slate-400";

      // Restore blue "Browse" action on the right
      actionSpan.textContent = "Browse";
      actionSpan.className = "text-blue-600 font-semibold shrink-0";
    }
  });
}

// Operational Supportive Document Deletion Controller
async function deleteSupportiveDoc(slotKey) {
  const selector = document.getElementById("uploadLetterSelect");
  if (!selector) return;

  const selectedDocId = selector.value;

  // User confirmation warning
  const confirmDelete = confirm(
    `Are you sure you want to permanently delete this supportive document? This action cannot be undone.`,
  );
  if (!confirmDelete) return;

  const status = document.getElementById("uploadStatus");
  if (status) {
    status.className = "text-[10px] font-semibold text-blue-600 mt-2";
    status.textContent =
      "Deleting file from server & resetting database fields...";
    status.classList.remove("hidden");
  }

  try {
    const payload = new FormData();
    payload.append("doc_id", selectedDocId);
    payload.append("slot", slotKey);

    const response = await fetch("delete_doc.php", {
      method: "POST",
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      if (status) {
        status.className = "text-[10px] font-semibold text-emerald-600 mt-2";
        status.textContent = "File deleted successfully.";
      }

      isNewLetterGenerated = true; // Set to true so page reloads on modal close to refresh local records cache

      setTimeout(() => {
        window.location.reload(); // Reload to refresh local records database cache
      }, 1000);
    } else {
      alert(data.message || "Deletion failed.");
      if (status) status.classList.add("hidden");
    }
  } catch (err) {
    console.error("File deletion failed:", err);
    alert("Deletion failed: " + err.message);
    if (status) status.classList.add("hidden");
  }
}
