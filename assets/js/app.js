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

document
  .getElementById("certificateForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");

    // UI Loading State
    submitBtn.disabled = true;
    btnSpinner.classList.remove("hidden");
    btnText.textContent = "Registering Entry...";

    const formData = new FormData(this);
    let rawResponseText = "";

    try {
      const response = await fetch("generate_pdf.php", {
        method: "POST",
        body: formData,
      });

      rawResponseText = await response.text();

      // Parse JSON payload
      const resData = JSON.parse(rawResponseText);

      if (resData.status === "success") {
        currentDocId = resData.doc_id;
        currentRecord = resData.data;
        currentVerifyUrl = resData.verify_url;

        // 1. First clone the hidden template into the modal canvas area
        const previewArea = document.getElementById("visualPreviewArea");
        const templateSrc = document.getElementById("pdfRenderingTemplate");

        if (previewArea && templateSrc) {
          const templateClone = templateSrc.cloneNode(true);
          templateClone.id = "clonedPdfTemplate"; // prevent ID duplicate issues
          previewArea.innerHTML = "";
          previewArea.appendChild(templateClone);
        }

        // 2. Populate both the hidden and cloned versions now that they exist in the DOM
        populateTemplate(currentRecord, currentVerifyUrl);

        // 3. Populate Modal text elements
        const modalDocIdEl = document.getElementById("modalDocId");
        if (modalDocIdEl) modalDocIdEl.textContent = `Doc ID: ${currentDocId}`;

        const targetEmailEl = document.getElementById("targetEmail");
        if (targetEmailEl) targetEmailEl.value = currentRecord.email;

        openModal();
      } else {
        alert(resData.message || "Error occurred while saving entry.");
      }
    } catch (error) {
      console.error("Raw Server Response:", rawResponseText);
      console.error("JS Processing Error details:", error);
      alert("Browser JavaScript Error: " + error.message);
    } finally {
      submitBtn.disabled = false;
      btnSpinner.classList.add("hidden");
      btnText.textContent = "Generate Digital Document";
    }
  });

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

// PDF Generation Options with dynamic naming rules
function getHtml2PdfOptions() {
  // Generates clean, dynamic names based on selected Letter Type (e.g., Appointment_Letter_DOC-2026-A883D1.pdf)
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
      width: 794,
      height: 1123,
    },
    jsPDF: {
      unit: "px",
      format: [794, 1123],
      orientation: "portrait",
      hotfixes: ["px_scaling"],
    },
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

function closeModal() {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    const status = document.getElementById("emailStatus");
    if (status) status.classList.add("hidden");
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
