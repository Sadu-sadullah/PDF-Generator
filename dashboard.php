<?php
require_once 'includes/auth.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | Letter & PDF System</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">

    <!-- Plug & Play Client-Side PDF & QR Generation Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>

<body class="bg-slate-50 min-h-screen text-slate-800 flex flex-col">

    <!-- Top Navigation Bar -->
    <header class="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                        </path>
                    </svg>
                </div>
                <div>
                    <span class="font-bold text-sm tracking-tight block">DocuVerify</span>
                    <span class="text-[10px] text-slate-400 block -mt-1">Control Panel</span>
                </div>
            </div>

            <div class="flex items-center space-x-4">
                <div class="hidden sm:flex items-center space-x-2 bg-slate-800 py-1.5 px-3 rounded-full text-xs">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span
                        class="text-slate-300 font-medium"><?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Admin User'); ?></span>
                </div>
                <a href="logout.php"
                    class="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 py-2 px-4 rounded-lg transition">
                    Sign Out
                </a>
            </div>
        </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-3xl mx-auto">
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Generate Letters</h2>
                <p class="text-sm text-slate-500 mt-1">Input the records below to generate a validated, QR-secured PDF
                    letter.</p>
            </div>

            <form id="certificateForm" class="space-y-6">
                <!-- Section 1: Recipient Information -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">1. Personal
                            Information</h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">First
                                Name</label>
                            <input type="text" name="first_name" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Last
                                Name</label>
                            <input type="text" name="last_name" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Nationality</label>
                            <select name="nationality" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="">Select nationality...</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Singapore">Singapore</option>
                                <option value="United Arab Emirates">United Arab Emirates</option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Passport
                                / National ID Number</label>
                            <input type="text" name="passport" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g., A12345678">
                        </div>
                        <div class="md:col-span-2">
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Date
                                of Birth</label>
                            <input type="date" name="dob" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Designation</label>
                            <select name="designation" id="designationSelect" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="">Select Designation...</option>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Project Manager">Project Manager</option>
                                <option value="Data Analyst">Data Analyst</option>
                                <option value="Financial Consultant">Financial Consultant</option>
                                <option value="HR Specialist">HR Specialist</option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Average
                                Salary (USD)</label>
                            <input type="text" name="salary" id="salaryInput" readonly
                                class="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                                placeholder="$0.00">
                        </div>
                    </div>
                </div>

                <!-- Section 2: Contact Details -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">2. Contact Details
                        </h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone
                                Number</label>
                            <input type="tel" name="phone" placeholder="+1 234 567 8900" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email
                                Address</label>
                            <input type="email" name="email" placeholder="recipient@domain.com" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                        </div>
                    </div>
                </div>

                <!-- Section 3: Document Metadata -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">3. Document Metadata
                        </h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Letter
                                Type
                                Title</label>
                            <select name="certificate_title" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="Appointment Letter">Appointment Letter</option>
                                <option value="Interview Letter">Interview Letter</option>
                                </option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Issue
                                Date & Time</label>
                            <input type="datetime-local" name="issue_date" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value="<?php echo date('Y-m-d\TH:i'); ?>">
                        </div>
                        <div>
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Expiry
                                Date & Time</label>
                            <input type="datetime-local" name="expiry_date" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value="<?php echo date('Y-m-d\TH:i', strtotime('+1 year')); ?>">
                        </div>
                        <div class="md:col-span-2">
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Timezone</label>
                            <select name="timezone" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="UTC">UTC (Coordinated Universal Time / UTC+0)</option>
                                <option value="EST">EST (Eastern Standard Time / UTC-5)</option>
                                <option value="GMT">GMT (Greenwich Mean Time / UTC+0)</option>
                                <option value="SGT">SGT (Singapore Time / UTC+8)</option>
                                <option value="GST">GST (Gulf Standard Time / UTC+4)</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label
                                class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Letter
                                Issuing
                                Company</label>
                            <input type="text" name="authority" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g., Department of Compliance">
                        </div>
                    </div>
                </div>

                <div class="text-right">
                    <button type="submit" id="submitBtn"
                        class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-3 rounded-xl transition duration-200 shadow-md">
                        <span id="btnText">Generate Digital Document</span>
                        <svg id="btnSpinner" class="hidden animate-spin ml-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    </main>

    <!-- Interactive Actions & PDF Preview Modal (Always side-by-side on tablets and desktops) -->
    <div id="previewModal" class="fixed inset-0 z-50 overflow-y-auto hidden" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onclick="closeModal()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div
                class="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
                <!-- Modal Header -->
                <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-base leading-6" id="modal-title">Letter Successfully Generated
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5" id="modalDocId">Doc ID: ---</p>
                    </div>
                    <button onclick="closeModal()"
                        class="text-slate-400 hover:text-white transition focus:outline-none">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Modal Body (Always split columns on md screens and up) -->
                <div class="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-100">
                    <!-- PDF Canvas Area -->
                    <div class="flex-grow p-4 bg-slate-200 md:w-3/5 lg:w-2/3">
                        <div class="w-full bg-white rounded border border-slate-300 shadow-sm overflow-y-auto h-[500px] p-6"
                            id="previewCanvasContainer">
                            <div id="visualPreviewArea" class="bg-white"></div>
                        </div>
                    </div>

                    <!-- Actions Panel (Always visible on the right on md+) -->
                    <div class="w-full md:w-2/5 lg:w-80 p-6 bg-white flex flex-col justify-between">
                        <div class="space-y-4">
                            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Document Tasks</h4>

                            <button onclick="triggerPDFDownload()"
                                class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
                                <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Download PDF
                            </button>

                            <button onclick="triggerPDFPrint()"
                                class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
                                <svg class="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                                    </path>
                                </svg>
                                Print Document
                            </button>

                            <div class="border-t border-slate-100 pt-4 mt-4">
                                <label
                                    class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Share
                                    Letter</label>
                                <button onclick="shareDocument()"
                                    class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-blue-600 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                                    <!-- Standard Box Up-Arrow Share Icon -->
                                    <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        class="lucide lucide-share" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <polyline points="16 6 12 2 8 6" />
                                        <line x1="12" x2="12" y1="2" y2="15" />
                                    </svg>
                                    Share / Send File
                                </button>
                                <p id="shareStatus" class="hidden text-[10px] mt-1.5"></p>
                            </div>
                        </div>

                        <div class="mt-8 pt-4 border-t border-slate-100">
                            <p class="text-[10px] text-slate-400 leading-normal">
                                Generated client-side. The public verification record is active on server databases.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>



    <!-- HIDDEN CONTAINER FOR PDF GENERATION LAYOUT (Positioned absolutely off-screen to allow canvas compilation) -->
    <div style="position: absolute; left: -9999px; top: 0; width: 794px; overflow: hidden; z-index: -9999;">

        <!-- Plain wrapper holding both pages -->
        <div id="pdfRenderingTemplate">

            <!-- PAGE 1 CONTAINER (Sized to 1110px to prevent micro-pixel pagination overflows) -->
            <div
                style="width: 794px; height: 1110px; padding: 45px; background-color: #ffffff; color: #334155; box-sizing: border-box; position: relative; text-align: left; margin: 0 auto; overflow: hidden;">

                <!-- Header Band (Page 1) -->
                <table
                    style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <tr>
                        <td style="padding: 20px; width: 110px; vertical-align: middle; text-align: left;">
                            <img src="assets/img/company_logo.png"
                                style="max-height: 45px; max-width: 110px; display: block;" alt="[LOGO]">
                        </td>
                        <td style="padding: 20px 10px; vertical-align: middle; text-align: left;">
                            <h1
                                style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                DocuVerify Registry</h1>
                            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0;">Official Statement of
                                Clearance and Status</p>
                        </td>
                        <td style="padding: 20px; text-align: right; vertical-align: middle; width: 280px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td
                                        style="text-align: right; font-size: 10px; color: #475569; line-height: 1.4; padding-right: 12px; vertical-align: middle;">
                                        <strong>Doc ID:</strong> <span class="pdf-val-doc_id"
                                            style="font-family: monospace; font-weight: bold;">---</span><br>
                                        <strong>Generated:</strong> <span class="pdf-val-issue_date">---</span><br>
                                        <strong>Expiry:</strong> <span class="pdf-val-expiry_date">---</span>
                                    </td>
                                    <td style="width: 75px; vertical-align: middle; text-align: right;">
                                        <img class="pdf-val-qr-img" src=""
                                            style="width: 75px; height: 75px; display: block; border: 1px solid #cbd5e1; background-color: #ffffff; border-radius: 4px; padding: 2px;"
                                            alt="QR Code">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Body Title -->
                <table style="width: 100%; border-collapse: collapse; margin-top: 35px;">
                    <tr>
                        <td style="text-align: left;">
                            <h2 class="pdf-val-certificate_title"
                                style="font-size: 20px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 0 0 12px 0;">
                                Certificate</h2>
                            <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 25px 0;">
                                This document serves as formal confirmation that the recipient specified below has
                                undergone verification checks and aligns with validation structures under registered
                                protocol.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Section 1: Recipient Table -->
                <div
                    style="font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 15px; margin-bottom: 10px;">
                    1. Recipient Details
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b; width: 30%;">Full Name</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 500;" class="pdf-val-name">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Nationality</td>
                        <td style="padding: 8px 0; color: #0f172a;" class="pdf-val-nationality">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ID/Passport Number</td>
                        <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-weight: bold;"
                            class="pdf-val-passport">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Date of Birth</td>
                        <td style="padding: 8px 0; color: #0f172a;" class="pdf-val-dob">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Designation</td>
                        <td style="padding: 8px 0; color: #0f172a;" class="pdf-val-designation">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Average Salary</td>
                        <td style="padding: 8px 0; color: #0f172a;" class="pdf-val-salary">---</td>
                    </tr>
                </table>

                <!-- Section 2: Audit Table -->
                <div
                    style="font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px;">
                    2. Administrative Audit Trail
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b; width: 30%;">Issuing Authority
                        </td>
                        <td style="padding: 8px 0; color: #0f172a;" class="pdf-val-authority">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Date of Issue</td>
                        <td style="padding: 8px 0; color: #0f172a;" class="pdf-val-issue_date_long">---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Expiration Status</td>
                        <td style="padding: 8px 0; color: #dc2626; font-weight: bold;" class="pdf-val-expiry_date_long">
                            ---</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Compliance Status</td>
                        <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">Verified & Approved</td>
                    </tr>
                </table>

                <!-- Signatures & Stamp block -->
                <table
                    style="width: 100%; border-collapse: collapse; border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 50px;">
                    <tr>
                        <td style="width: 45%; text-align: left; vertical-align: top; padding-right: 15px;">
                            <div style="font-size: 11.5px; font-weight: bold; color: #0f172a; margin-bottom: 3px;">
                                Registry Verification Unit</div>
                            <p style="font-size: 9px; color: #94a3b8; line-height: 1.4; margin: 0;">
                                <strong>Security Protection Disclaimer:</strong> This is an official document validated
                                through local system archives. To verify authenticity, scan the associated header QR
                                code. Direct modification of this document's printed layout compromises valid
                                registration.
                            </p>
                        </td>
                        <td style="width: 25%; text-align: center; vertical-align: middle;">
                            <div
                                style="border: 1px dashed #cbd5e1; border-radius: 50%; width: 85px; height: 85px; display: inline-block; line-height: 85px; text-align: center; position: relative;">
                                <img src="assets/img/seal.png"
                                    style="max-height: 80px; max-width: 80px; position: absolute; top: 2px; left: 2px; opacity: 0.85;"
                                    alt="">
                                <span
                                    style="font-size: 8px; color: #94a3b8; font-weight: bold; display: block; line-height: 85px;">STAMP
                                    AREA</span>
                            </div>
                        </td>
                        <td style="width: 30%; text-align: right; vertical-align: bottom;">
                            <div style="display: inline-block; text-align: center; width: 140px;">
                                <div style="text-align: center; margin-bottom: 2px;">
                                    <img src="assets/img/signature.png"
                                        style="max-height: 45px; max-width: 120px; display: inline-block; vertical-align: bottom;"
                                        alt="">
                                </div>
                                <div style="border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 2px;">
                                    <div style="font-size: 10px; font-weight: bold; color: #0f172a;">Authorized
                                        Signatory</div>
                                    <div style="font-size: 9px; color: #94a3b8;">DocuVerify Secretariat</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Footer (Page 1 of 2) -->
                <div style="position: absolute; bottom: 35px; left: 45px; right: 45px;">
                    <table
                        style="width: 100%; border-collapse: collapse; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        <tr>
                            <td style="width: 33%; text-align: left; vertical-align: middle;">[LEFT FOOTER PLACEHOLDER]
                            </td>
                            <td
                                style="width: 34%; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                                Page 1 of 2</td>
                            <td style="width: 33%; text-align: right; vertical-align: middle;">[RIGHT FOOTER
                                PLACEHOLDER]</td>
                        </tr>
                    </table>
                </div>

            </div>

            <!-- Page Break Element (Strict CSS rule with zero height to prevent spacing leaks) -->
            <div class="html2pdf__page-break"
                style="page-break-before: always; clear: both; height: 0; line-height: 0; font-size: 0; margin: 0; padding: 0; border: none;">
            </div>

            <!-- PAGE 2 CONTAINER (Sized to 1110px to prevent micro-pixel pagination overflows) -->
            <div
                style="width: 794px; height: 1110px; padding: 45px; background-color: #ffffff; color: #334155; box-sizing: border-box; position: relative; text-align: left; margin: 0 auto; overflow: hidden;">

                <!-- Header Band (Page 2) -->
                <table
                    style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <tr>
                        <td style="padding: 20px; width: 110px; vertical-align: middle; text-align: left;">
                            <img src="assets/img/company_logo.png"
                                style="max-height: 45px; max-width: 110px; display: block;" alt="[LOGO]">
                        </td>
                        <td style="padding: 20px 10px; vertical-align: middle; text-align: left;">
                            <h1
                                style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                DocuVerify Registry</h1>
                            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0;">Official Statement of
                                Clearance and Status</p>
                        </td>
                        <td style="padding: 20px; text-align: right; vertical-align: middle; width: 280px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td
                                        style="text-align: right; font-size: 10px; color: #475569; line-height: 1.4; padding-right: 12px; vertical-align: middle;">
                                        <strong>Doc ID:</strong> <span class="pdf-val-doc_id"
                                            style="font-family: monospace; font-weight: bold;">---</span><br>
                                        <strong>Generated:</strong> <span class="pdf-val-issue_date">---</span><br>
                                        <strong>Expiry:</strong> <span class="pdf-val-expiry_date">---</span>
                                    </td>
                                    <td style="width: 75px; vertical-align: middle; text-align: right;">
                                        <img class="pdf-val-qr-img" src=""
                                            style="width: 75px; height: 75px; display: block; border: 1px solid #cbd5e1; background-color: #ffffff; border-radius: 4px; padding: 2px;"
                                            alt="QR Code">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Section Header (Page 2) -->
                <div
                    style="font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 35px; margin-bottom: 10px;">
                    Annexure - Terms & Conditions of Employment
                </div>

                <!-- Page 2 Contents: Annexure Data Rows -->
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.55;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td
                            style="width: 32%; padding: 10px 0; font-weight: bold; color: #0f172a; vertical-align: top; text-transform: uppercase;">
                            Period of Employment:</td>
                        <td style="width: 68%; padding: 10px 0; color: #475569; vertical-align: top;">(2) Two years,
                            renewable as per mutual agreement.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td
                            style="width: 32%; padding: 10px 0; font-weight: bold; color: #0f172a; vertical-align: top; text-transform: uppercase;">
                            Early Termination of Contract:</td>
                        <td style="width: 68%; padding: 10px 0; color: #475569; vertical-align: top;">If the Employee
                            resigns before completing the agreed contract period, he shall comply with the UAE Labour
                            Law, the Company's termination procedures, and the applicable notice period. Any outstanding
                            obligations, commitments, or dues between the Company and the Employee shall be settled in
                            accordance with the UAE Labour Law and applicable regulations.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td
                            style="width: 32%; padding: 10px 0; font-weight: bold; color: #0f172a; vertical-align: top; text-transform: uppercase;">
                            Probation:</td>
                        <td style="width: 68%; padding: 10px 0; color: #475569; vertical-align: top;">A period of (6)
                            months (six months maximum) shall be the probation period during which this contract may be
                            terminated by the company with a 14 days' written notice and by the employee with a 30 days'
                            written notice. In the event the employee resigns from the employment relationship for the
                            purposes of leaving the UAE, such notice will be reduced to 14 days.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td
                            style="width: 32%; padding: 10px 0; font-weight: bold; color: #0f172a; vertical-align: top; text-transform: uppercase;">
                            Holiday Entitlement:</td>
                        <td style="width: 68%; padding: 10px 0; color: #475569; vertical-align: top;">You are entitled
                            to 30 calendar days of holiday leave per annum, in addition to public holidays as declared
                            by the government. Due to the nature of the company's business, you may be required to work
                            on certain public holidays. This is an inherent condition of employment. By accepting this
                            offer, you acknowledge and agree to work on these days as and when required.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td
                            style="width: 32%; padding: 10px 0; font-weight: bold; color: #0f172a; vertical-align: top; text-transform: uppercase;">
                            Annual Flight:</td>
                        <td style="width: 68%; padding: 10px 0; color: #475569; vertical-align: top;">After the
                            successful completion of two (2) years of service, and at the discretion of the company, you
                            will receive an annual flight ticket to your home country. The company will determine the
                            airfare for each sector once a year, in accordance with the policy of the company.</td>
                    </tr>
                </table>

                <!-- Footer (Page 2 of 2) -->
                <div style="position: absolute; bottom: 35px; left: 45px; right: 45px;">
                    <table
                        style="width: 100%; border-collapse: collapse; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        <tr>
                            <td style="width: 33%; text-align: left; vertical-align: middle;">[LEFT FOOTER PLACEHOLDER]
                            </td>
                            <td
                                style="width: 34%; text-align: center; vertical-align: middle; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                                Page 2 of 2</td>
                            <td style="width: 33%; text-align: right; vertical-align: middle;">[RIGHT FOOTER
                                PLACEHOLDER]</td>
                        </tr>
                    </table>
                </div>

            </div>

        </div>

    </div> <!-- Added: Closes the outer off-screen position wrapper -->

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
            &copy; 2026 DocuVerify Corp. Client Demonstration System.
        </div>
    </footer>

    <!-- Frontend controller script -->
    <script src="assets/js/app.js"></script>
</body>

</html>