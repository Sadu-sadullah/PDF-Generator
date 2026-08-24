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
  // Generate QR code safely for all matching container classes
  const qrContainers = document.querySelectorAll(".pdf-val-qr-container");
  if (qrContainers.length > 0) {
    qrContainers.forEach((container) => {
      container.innerHTML = ""; // Reset container
      if (typeof QRCode !== "undefined") {
        new QRCode(container, {
          text: verifyUrl,
          width: 100,
          height: 100,
          correctLevel: QRCode.CorrectLevel.M,
        });
      } else {
        console.error("QRCode library is not loaded.");
        container.innerHTML =
          '<span class="text-xs text-red-500">QR Engine Missing</span>';
      }
    });
  }

  // Populate selectors with safety checks across all elements
  setSelectorText(".pdf-val-doc_id", record.doc_id);
  setSelectorText(".pdf-val-issue_date", formatDate(record.issue_date));
  setSelectorText(".pdf-val-expiry_date", formatDate(record.expiry_date));
  setSelectorText(".pdf-val-certificate_title", record.certificate_title);

  setSelectorText(".pdf-val-name", `${record.first_name} ${record.last_name}`);
  setSelectorText(".pdf-val-nationality", record.nationality);
  setSelectorText(".pdf-val-passport", record.passport);
  setSelectorText(".pdf-val-dob", formatDate(record.dob));

  setSelectorText(".pdf-val-authority", record.authority);
  setSelectorText(".pdf-val-issue_date_long", formatDate(record.issue_date));
  setSelectorText(
    ".pdf-val-expiry_date_long",
    `Valid Until ${formatDate(record.expiry_date)}`,
  );
}

// Formatters for presentation
function formatDate(dateString) {
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

// PDF Generation Options using locked A4 pixel sizes and scroll lockouts
function getHtml2PdfOptions() {
  return {
    margin: 0,
    filename: `certificate_${currentDocId}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0, // Enforces rendering from absolute top coordinate
      scrollX: 0, // Enforces rendering from absolute left coordinate
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

// Download PDF directly from the hidden template
function triggerPDFDownload() {
  const element = document.getElementById("pdfRenderingTemplate");
  if (element) {
    html2pdf().set(getHtml2PdfOptions()).from(element).save();
  }
}

// Print PDF
function triggerPDFPrint() {
  const element = document.getElementById("pdfRenderingTemplate");
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
    const pdfFile = new File([pdfBlob], `certificate_${currentDocId}.pdf`, {
      type: "application/pdf",
    });

    // Check if the platform's browser supports sharing files natively (WhatsApp, AirDrop, etc.)
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      shareStatus.textContent = "Opening system share menu...";

      await navigator.share({
        files: [pdfFile],
        title: `Official Statement of Clearance - ${currentDocId}`,
        text: `Please find the official clearance statement for ${currentRecord.first_name} ${currentRecord.last_name} (ID: ${currentDocId}) attached.\n\nVerify details here: ${currentVerifyUrl}`,
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
          `Certificate Title: ${currentRecord.certificate_title}\n` +
          `Registry Verification Link: ${currentVerifyUrl}\n\n` +
          `Please attach your downloaded certificate PDF (certificate_${currentDocId}.pdf) to this message before sending.`,
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
