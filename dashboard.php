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

    <!-- Main Workspace Container (Tabbed Layout) -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-4xl mx-auto">

            <!-- Restructured Full-Width Stacked Header & Tab Switcher -->
            <div class="border-b border-slate-200 pb-5 mb-8 space-y-5">

                <!-- Top Block: Header & Sub-Header Text (Spans 100% width) -->
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 tracking-tight">DocuVerify Console</h2>
                    <p class="text-sm text-slate-500 mt-1">Manage compliance letters, attach supportive files, and
                        dispatch records.</p>
                </div>

                <!-- Simplified static full-width segment selector container -->
                <div id="scrollableTabSelector"
                    class="w-full overflow-x-auto whitespace-nowrap bg-slate-200/60 p-1 rounded-xl border border-slate-200 shadow-sm flex no-scrollbar"
                    style="-ms-overflow-style: none; scrollbar-width: none;">
                    <style>
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    </style>
                    <button id="tabBtnGenerate" onclick="switchTab('generate')"
                        class="shrink-0 px-5 py-2.5 text-xs font-semibold rounded-lg transition duration-150 bg-white text-slate-900 shadow-sm">
                        Generate New
                    </button>
                    <button id="tabBtnArchive" onclick="switchTab('archive')"
                        class="shrink-0 px-5 py-2.5 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900">
                        Archived Letters
                    </button>
                    <button id="tabBtnEmail" onclick="switchTab('email')"
                        class="shrink-0 px-5 py-2.5 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900">
                        Email Dispatcher
                    </button>
                    <button id="tabBtnUpload" onclick="switchTab('upload')"
                        class="shrink-0 px-5 py-2.5 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900">
                        Supportive Docs
                    </button>
                    <button id="tabBtnBulk" onclick="switchTab('bulk')"
                        class="shrink-0 px-5 py-2.5 text-xs font-semibold rounded-lg transition duration-150 text-slate-600 hover:text-slate-900">
                        Bulk Creation
                    </button>
                </div>
            </div>

            <!-- TAB A: Generation Form -->
            <div id="tabPanelGenerate" class="space-y-6">
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

                    <!-- Section 3: Document Metadata (Restructured to 3-column Date & Timezone row) -->
                    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">3. Document
                                Metadata</h3>
                        </div>
                        <!-- Parent Grid updated to md:grid-cols-3 -->
                        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

                            <!-- Letter Type Title (Spans all 3 columns) -->
                            <div class="md:col-span-3">
                                <label
                                    class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Letter
                                    Type Title</label>
                                <select name="certificate_title" required
                                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="Appointment Letter">Appointment Letter</option>
                                    <option value="Interview Letter">Interview Letter</option>
                                </select>
                            </div>

                            <!-- Column 1: Issue Date -->
                            <div>
                                <label
                                    class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Issue
                                    Date & Time</label>
                                <input type="datetime-local" name="issue_date" required
                                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value="<?php echo date('Y-m-d\TH:i'); ?>">
                            </div>

                            <!-- Column 2: Expiry Date -->
                            <div>
                                <label
                                    class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Expiry
                                    Date & Time</label>
                                <input type="datetime-local" name="expiry_date" required
                                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value="<?php echo date('Y-m-d\TH:i', strtotime('+1 year')); ?>">
                            </div>

                            <!-- Column 3: Timezone -->
                            <div>
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

                            <!-- Letter Issuing Company (Spans all 3 columns) -->
                            <div class="md:col-span-3">
                                <label
                                    class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Letter
                                    Issuing Company</label>
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
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            <!-- TAB B: Letters Archive Archive -->
            <div id="tabPanelArchive" class="hidden space-y-6">
                <!-- Updated: Search, Status, Type, and Date Range filter selectors -->
                <div
                    class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Search Input -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Search
                            Records</label>
                        <input type="text" id="archiveSearch" oninput="applyFilters()"
                            placeholder="Doc ID, Name, Passport..."
                            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    </div>
                    <!-- Status Filter -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Compliance
                            Status</label>
                        <select id="filterStatus" onchange="applyFilters()"
                            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            <option value="ALL">All Records</option>
                            <option value="VALID">Valid / Active</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                    <!-- Letter Type Filter -->
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Letter
                            Type</label>
                        <select id="filterType" onchange="applyFilters()"
                            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            <option value="ALL">All Types</option>
                            <option value="Appointment Letter">Appointment Letter</option>
                            <option value="Interview Letter">Interview Letter</option>
                        </select>
                    </div>
                    <!-- NEW: Date filtration and radio button parameters -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">Filter by
                            Date</label>
                        <div class="relative flex items-center">
                            <input type="date" id="filterDate" onchange="applyFilters()"
                                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            <button type="button" onclick="clearDateFilter()"
                                class="absolute right-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs transition"
                                title="Clear Calendar Filter">
                                Clear
                            </button>
                        </div>
                        <div class="flex items-center space-x-3 pt-0.5">
                            <label
                                class="inline-flex items-center text-[11px] font-semibold text-slate-600 cursor-pointer">
                                <input type="radio" name="filterDateType" value="ISSUE" checked
                                    onchange="applyFilters()"
                                    class="w-3 h-3 text-blue-600 border-slate-300 focus:ring-blue-500 mr-1">
                                Issued On
                            </label>
                            <label
                                class="inline-flex items-center text-[11px] font-semibold text-slate-600 cursor-pointer">
                                <input type="radio" name="filterDateType" value="EXPIRY" onchange="applyFilters()"
                                    class="w-3 h-3 text-blue-600 border-slate-300 focus:ring-blue-500 mr-1">
                                Expiring On
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Responsive Archive Table with Integrated Export Action Bar -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    <!-- Table Header Action Bar (New Feature) -->
                    <div
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 border-b border-slate-200 px-6 py-4 gap-4">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Letter Transactions
                            Database</span>
                        <div class="flex items-center space-x-2 shrink-0">
                            <!-- Export Selected Button -->
                            <button onclick="exportSelectedLetters()"
                                class="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm">
                                <svg class="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Export Selected
                            </button>
                            <!-- Export All Button -->
                            <button onclick="exportAllLetters()"
                                class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                                <svg class="w-3.5 h-3.5 mr-1.5 text-white" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Export All
                            </button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="border-b border-slate-100 bg-slate-50/20 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <!-- Added: Master selection checkbox -->
                                    <th class="py-4 px-6 text-center w-12"><input type="checkbox" id="archiveSelectAll"
                                            checked onclick="toggleAllArchive(this)"
                                            class="w-3.5 h-3.5 text-blue-600 rounded"></th>
                                    <th class="py-4 px-6">Doc ID</th>
                                    <th class="py-4 px-6">Recipient Name</th>
                                    <th class="py-4 px-6 text-center">Type</th>
                                    <th class="py-4 px-6">Issued Date</th>
                                    <th class="py-4 px-6">Expiry Date</th>
                                    <th class="py-4 px-6">Status</th>
                                    <th class="py-4 px-6 text-right">Preview</th>
                                </tr>
                            </thead>
                            <tbody id="recordsTableBody" class="divide-y divide-slate-100 text-sm">
                                <!-- JS populated elements go here -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Empty State Placeholder -->
                    <div id="emptyState" class="hidden p-12 text-center">
                        <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg>
                        <p class="text-sm font-semibold text-slate-600">No matching letters discovered.</p>
                        <p class="text-xs text-slate-400 mt-1">Adjust your search strings or filtration drop-downs.</p>
                    </div>

                    <!-- Pagination Controls -->
                    <div class="bg-slate-50 border-t border-slate-100 py-3.5 px-6 flex items-center justify-between">
                        <span id="paginationInfo" class="text-xs text-slate-500 font-medium">Showing 0 to 0 of 0
                            entries</span>
                        <div class="flex items-center space-x-2">
                            <button id="prevBtn" onclick="prevPage()"
                                class="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm">
                                Previous
                            </button>
                            <button id="nextBtn" onclick="nextPage()"
                                class="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div> <!-- Closes tabPanelArchive -->

            <!-- RESTORED: TAB 3 (Email Dispatcher Panel Container) -->
            <div id="tabPanelEmail" class="hidden space-y-6">
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">System Mail Dispatcher
                        </h3>
                    </div>

                    <form id="dispatcherEmailForm" onsubmit="sendDispatcherEmail(event)" class="p-6 space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select
                                Letter to Attach</label>
                            <select id="dispatcherLetterSelect" name="dispatcherLetterSelect"
                                onchange="autoFillEmailRecipient()" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                <option value="">Select a generated letter...</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Recipient
                                    Email (To)</label>
                                <input type="email" id="dispatcherTo" required
                                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                            <div>
                                <label
                                    class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject</label>
                                <input type="text" id="dispatcherSubject" required
                                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                        </div>
                        <div>
                            <label
                                class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Message
                                Body</label>
                            <textarea id="dispatcherMessage" rows="8" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"></textarea>
                        </div>

                        <div class="flex items-center space-x-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                            <input type="checkbox" id="dispatcherAttachCheck" checked
                                class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                            <div>
                                <span class="block text-xs font-semibold text-blue-800">Attach Selected PDF
                                    Document</span>
                                <span class="block text-[10px] text-blue-500 -mt-0.5">The system will compile and attach
                                    the letter PDF as an attachment automatically</span>
                            </div>
                        </div>

                        <p id="dispatcherEmailStatus" class="hidden text-[10px] font-semibold text-blue-600"></p>

                        <div class="text-right border-t border-slate-100 pt-4">
                            <button type="submit" id="dispatcherSubmitBtn"
                                class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition shadow-md">
                                <span id="dispatcherBtnText">Dispatch Email</span>
                                <svg id="dispatcherSpinner" class="hidden animate-spin ml-2 h-3.5 w-3.5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- RESTORED: TAB 4 (Supportive Docs Panel Container) -->
            <div id="tabPanelUpload" class="hidden space-y-6">
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">Upload Supportive
                            Documents</h3>
                    </div>

                    <form id="supportiveDocsForm" onsubmit="uploadSupportiveDocs(event)" enctype="multipart/form-data"
                        class="p-6 space-y-6">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select
                                Target Generated Letter</label>
                            <select id="uploadLetterSelect" name="uploadLetterSelect" required
                                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                <option value="">Select a generated letter...</option>
                            </select>
                        </div>

                        <!-- Responsive File Upload Grid with Dynamic Action Labels -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            <!-- Slot 1: Passport -->
                            <div
                                class="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="block text-xs font-bold text-slate-700">1. Passport Copy</span>
                                    <span id="status_passport"
                                        class="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Pending</span>
                                </div>
                                <input type="file" name="support_passport" id="file_passport"
                                    onchange="updateFileLabel('passport')" class="hidden">
                                <label for="file_passport"
                                    class="inline-flex items-center justify-between w-full px-3 py-2.5 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-600 transition">
                                    <span id="label_passport" class="truncate pr-2">Choose file...</span>
                                    <span id="action_passport"
                                        class="text-blue-600 font-semibold shrink-0">Browse</span>
                                </label>
                            </div>

                            <!-- Slot 2: National ID -->
                            <div
                                class="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="block text-xs font-bold text-slate-700">2. National ID / Residence
                                        Visa</span>
                                    <span id="status_national_id"
                                        class="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Pending</span>
                                </div>
                                <input type="file" name="support_national_id" id="file_national_id"
                                    onchange="updateFileLabel('national_id')" class="hidden">
                                <label for="file_national_id"
                                    class="inline-flex items-center justify-between w-full px-3 py-2.5 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-600 transition">
                                    <span id="label_national_id" class="truncate pr-2">Choose file...</span>
                                    <span id="action_national_id"
                                        class="text-blue-600 font-semibold shrink-0">Browse</span>
                                </label>
                            </div>

                            <!-- Slot 3: Academic Degree -->
                            <div
                                class="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="block text-xs font-bold text-slate-700">3. Academic Degree /
                                        Certificates</span>
                                    <span id="status_degree"
                                        class="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Pending</span>
                                </div>
                                <input type="file" name="support_degree" id="file_degree"
                                    onchange="updateFileLabel('degree')" class="hidden">
                                <label for="file_degree"
                                    class="inline-flex items-center justify-between w-full px-3 py-2.5 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-600 transition">
                                    <span id="label_degree" class="truncate pr-2">Choose file...</span>
                                    <span id="action_degree" class="text-blue-600 font-semibold shrink-0">Browse</span>
                                </label>
                            </div>

                            <!-- Slot 4: CV -->
                            <div
                                class="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="block text-xs font-bold text-slate-700">4. Curriculum Vitae (CV)</span>
                                    <span id="status_cv"
                                        class="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Pending</span>
                                </div>
                                <input type="file" name="support_cv" id="file_cv" onchange="updateFileLabel('cv')"
                                    class="hidden">
                                <label for="file_cv"
                                    class="inline-flex items-center justify-between w-full px-3 py-2.5 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-600 transition">
                                    <span id="label_cv" class="truncate pr-2">Choose file...</span>
                                    <span id="action_cv" class="text-blue-600 font-semibold shrink-0">Browse</span>
                                </label>
                            </div>

                            <!-- Slot 5: Employment Proof -->
                            <div
                                class="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between md:col-span-2">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="block text-xs font-bold text-slate-700">5. Previous Employment
                                        Certificate</span>
                                    <span id="status_employment"
                                        class="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Pending</span>
                                </div>
                                <input type="file" name="support_employment" id="file_employment"
                                    onchange="updateFileLabel('employment')" class="hidden">
                                <label for="file_employment"
                                    class="inline-flex items-center justify-between w-full px-3 py-2.5 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-600 transition">
                                    <span id="label_employment" class="truncate pr-2">Choose file...</span>
                                    <span id="action_employment"
                                        class="text-blue-600 font-semibold shrink-0">Browse</span>
                                </label>
                            </div>
                        </div>

                        <p id="uploadStatus" class="hidden text-[10px] font-semibold text-blue-600"></p>

                        <div class="text-right border-t border-slate-100 pt-4">
                            <button type="submit" id="uploadSubmitBtn"
                                class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition shadow-md">
                                <span id="uploadBtnText">Upload Documents</span>
                                <svg id="uploadSpinner" class="hidden animate-spin ml-2 h-3.5 w-3.5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div> <!-- Closes max-w-3xl -->
    </main> <!-- Closes main -->

    <!-- TAB E: Dedicated Bulk Document Creation Panel (Supporting both Direct & Staged workflows) -->
    <div id="tabPanelBulk" class="hidden space-y-6">

        <!-- CSV Drag-And-Drop / Import Card -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Left: Instructions & Exporter -->
            <div class="md:col-span-1 space-y-4">
                <h3 class="text-base font-bold text-slate-900">Bulk Generation</h3>
                <p class="text-xs text-slate-400 leading-relaxed">
                    Upload a standard spreadsheet (.csv) list. You can choose to process and compile records
                    instantly, or store them in your staging database to select and generate later.
                </p>

                <!-- Workflow Action Selector -->
                <div class="space-y-2 border-t border-slate-100 pt-3">
                    <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Choose
                        Workflow:</span>
                    <label class="flex items-center text-xs font-semibold text-slate-600 cursor-pointer">
                        <input type="radio" name="bulkWorkflowType" value="DIRECT" checked onchange="toggleWorkflowUI()"
                            class="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2">
                        Method 1: Direct Instant Compile
                    </label>
                    <label class="flex items-center text-xs font-semibold text-slate-600 cursor-pointer">
                        <input type="radio" name="bulkWorkflowType" value="STAGE" onchange="toggleWorkflowUI()"
                            class="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2">
                        Method 2: Upload & Stage in Database First
                    </label>
                </div>

                <button type="button" onclick="downloadCsvTemplate()"
                    class="w-full inline-flex items-center justify-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2.5 rounded-lg transition shadow-sm">
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download CSV Template
                </button>
            </div>

            <!-- Right: Drag and Drop Area -->
            <div class="md:col-span-2">
                <div id="dropZone" onclick="document.getElementById('csvFileInput').click()"
                    ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)"
                    ondrop="handleFileDrop(event)"
                    class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition duration-150 flex flex-col items-center justify-center min-h-[180px]">
                    <input type="file" id="csvFileInput" accept=".csv" onchange="handleFileSelect(event)"
                        class="hidden">
                    <svg class="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                        </path>
                    </svg>
                    <span class="block text-xs font-semibold text-slate-700">Drag and drop your spreadsheet
                        (.csv) here</span>
                    <span class="block text-[10px] text-slate-400 mt-1">or click to browse local folders</span>
                </div>
            </div>
        </div>

        <!-- PARSER CONFIRMATION CARD: For Way 1 (Direct Instant Compile) -->
        <div id="bulkQueueCard" class="hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">Method 1: Instant
                    Compile
                    Confirmation</h3>
            </div>

            <!-- Streamlined confirmation summary alert -->
            <div class="p-6 flex items-center space-x-4 bg-blue-50/50">
                <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <!-- Premium checkmark document icon -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-slate-900" id="bulkQueueTitle">Ready to Compile</h4>
                    <p class="text-xs text-slate-500 mt-0.5" id="bulkQueueMessage">0 records parsed from file.
                        Ready to generate bulk letters.</p>
                </div>
            </div>

            <!-- Progress bar and Compile button -->
            <div
                class="bg-slate-50 border-t border-slate-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div id="bulkProgressWrapper" class="hidden flex-grow max-w-md space-y-1.5">
                    <div class="flex justify-between text-xs font-semibold text-slate-600">
                        <span id="progressText">Generating letters...</span>
                        <span id="progressPct">0%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all duration-150"
                            style="width: 0%"></div>
                    </div>
                </div>
                <div class="ml-auto flex items-center space-x-3 shrink-0">
                    <button onclick="clearBulkQueue()"
                        class="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                    <button id="bulkCompileBtn" onclick="generateBulkQueue()"
                        class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition shadow-md">
                        <span id="bulkCompileText">Generate All Letters</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- STAGING CONSOLE: For Way 2 (Browse and compile from stored database records later) -->
        <div id="stagingConsoleCard"
            class="hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-700">Method 2: Staging
                        Database Queue</h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">Select from previously uploaded, ungenerated
                        profile list to compile letters</p>
                </div>
                <span id="stagingCountBadge"
                    class="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">0 Staged
                    Records</span>
            </div>

            <div class="overflow-x-auto max-h-[350px]">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 bg-white z-10">
                            <th class="py-3 px-6 text-center w-12"><input type="checkbox" id="stagingSelectAll" checked
                                    onclick="toggleAllStagingQueue(this)" class="w-3.5 h-3.5 text-amber-600 rounded">
                            </th>
                            <th class="py-3 px-6">Recipient Name</th>
                            <th class="py-3 px-6">Passport ID</th>
                            <th class="py-3 px-6">Designation</th>
                            <th class="py-3 px-6">Target Letter</th>
                            <th class="py-3 px-6">Import Date</th>
                        </tr>
                    </thead>
                    <tbody id="stagingQueueTableBody" class="divide-y divide-slate-100 text-xs text-slate-600">
                        <!-- JS populated dynamic rows -->
                    </tbody>
                </table>
            </div>

            <div
                class="bg-slate-50 border-t border-slate-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div id="stagingProgressWrapper" class="hidden flex-grow max-w-md space-y-1.5">
                    <div class="flex justify-between text-xs font-semibold text-slate-600">
                        <span id="stagingProgressText">Compiling staged letters...</span>
                        <span id="stagingProgressPct">0%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div id="stagingProgressBar" class="bg-amber-600 h-2 rounded-full transition-all duration-150"
                            style="width: 0%">
                        </div>
                    </div>
                </div>
                <div class="ml-auto flex items-center space-x-3 shrink-0">
                    <button onclick="clearStagingDatabase()"
                        class="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Clear
                        Database</button>
                    <button id="stagingCompileBtn" onclick="generateFromStagingArea()"
                        class="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition shadow-md">
                        <span id="stagingCompileText">Compile Selected Staged Letters</span>
                    </button>
                </div>
            </div>
        </div>

    </div>

    </div>
    </main>

    <!-- Interactive Actions & PDF Preview Modal (With Pre-Generation Review States) -->
    <div id="previewModal" class="fixed inset-0 z-50 overflow-y-auto hidden" role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onclick="closeModal()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div
                class="inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">

                <!-- Modal Header (Toggled dynamically by JS) -->
                <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <!-- Review State Title -->
                        <h3 class="font-bold text-base leading-6" id="modalHeaderReview">Review Letter Details</h3>
                        <!-- Final State Title -->
                        <h3 class="font-bold text-base leading-6 hidden" id="modalHeaderFinal">Letter Successfully
                            Generated</h3>
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

                <!-- Modal Body (Stacked Layout: Full-Width Document Canvas on top, Action Dock on bottom) -->
                <div class="flex flex-col bg-slate-100">

                    <!-- Top Block: Full-Width Document Canvas Area -->
                    <div class="p-6 bg-slate-200">
                        <!-- Sized to h-[550px] with flex centering for standard desktop display -->
                        <div class="w-full bg-white rounded-xl border border-slate-300 shadow-inner overflow-y-auto h-[550px] p-6 flex justify-center"
                            id="previewCanvasContainer">
                            <div id="visualPreviewArea" class="bg-white"></div>
                        </div>
                    </div>

                    <!-- Bottom Block: Horizontal Actions Dock (Toggled dynamically by JS) -->
                    <div
                        class="w-full p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <!-- PANEL STATE 1: PRE-GENERATION REVIEW ACTIONS -->
                        <div id="panelReviewState"
                            class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div class="max-w-md text-left">
                                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm
                                    Registration</h4>
                                <p class="text-[11px] text-slate-400 leading-normal mt-0.5">
                                    Please review the letter layout. Once confirmed, the document will be officially
                                    registered in the server database.
                                </p>
                            </div>
                            <div class="flex items-center space-x-3 shrink-0">
                                <button type="button" onclick="closeModal()"
                                    class="px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
                                    Go Back & Edit
                                </button>
                                <button type="button" onclick="confirmAndGenerate()" id="confirmSaveBtn"
                                    class="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shadow-sm">
                                    <span id="confirmBtnText">Confirm & Save Letter</span>
                                    <svg id="confirmSpinner" class="hidden animate-spin ml-2 h-3.5 w-3.5 text-white"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- STATE B: POST-GENERATION TASK ACTIONS (Updated to restore shareStatus element) -->
                        <div id="panelFinalState"
                            class="hidden w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div class="text-left">
                                <p class="text-[11px] text-slate-400 leading-normal">
                                    Generated client-side. The public verification record is active on server databases.
                                </p>
                                <!-- Restored: Status element now sits cleanly below description text -->
                                <p id="shareStatus" class="hidden text-[10px] font-semibold text-blue-600 mt-1"></p>
                            </div>

                            <!-- Standard Task Controls aligned side-by-side -->
                            <div class="flex flex-wrap items-center gap-3 shrink-0">
                                <button onclick="triggerPDFDownload()"
                                    class="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
                                    <svg class="w-3.5 h-3.5 mr-1.5 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Download PDF
                                </button>

                                <button onclick="triggerPDFPrint()"
                                    class="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm">
                                    <svg class="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z">
                                        </path>
                                    </svg>
                                    Print Document
                                </button>

                                <button onclick="shareDocument()"
                                    class="inline-flex items-center justify-center px-4 py-2 border border-blue-600 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                                    <!-- Standard Box Up-Arrow Share Icon -->
                                    <svg class="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                        <polyline points="16 6 12 2 8 6" />
                                        <line x1="12" x2="12" y1="2" y2="15" />
                                    </svg>
                                    Share / Send File
                                </button>
                            </div>
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

                <!-- Signatures & Stamp block (Page 1: Seal ONLY, Sized dynamically to prevent clipping) -->
                <table
                    style="width: 100%; border-collapse: collapse; border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 50px;">
                    <tr>
                        <!-- Left: Security disclaimer -->
                        <td style="width: 70%; text-align: left; vertical-align: top; padding-right: 15px;">
                            <div style="font-size: 11.5px; font-weight: bold; color: #0f172a; margin-bottom: 3px;">
                                Registry Verification Unit</div>
                            <p style="font-size: 9px; color: #94a3b8; line-height: 1.4; margin: 0;">
                                <strong>Security Protection Disclaimer:</strong> This is an official document validated
                                through local system archives. To verify authenticity, scan the associated header QR
                                code. Direct modification of this document's printed layout compromises valid
                                registration.
                            </p>
                        </td>
                        <!-- Right: Company Stamp Image (No signature) -->
                        <td style="width: 30%; text-align: right; vertical-align: middle;">
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

                <!-- Signatures & Stamp block (Page 2: Seal AND Signature, Sized dynamically to prevent clipping) -->
                <table
                    style="width: 100%; border-collapse: collapse; border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 40px;">
                    <tr>
                        <!-- Left: Security disclaimer -->
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
                        <!-- Middle: Company Stamp Image -->
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
                        <!-- Right: Signature Placeholder Image -->
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

    <!-- 1. Database Query & Injection (Placed ABOVE assets/js/app.js to prevent race conditions) -->
    <?php
    require_once 'includes/db.php';
    $db_records = [];
    try {
        // Fetch all generated letters ordered newest first
        $stmt = $pdo->query("SELECT * FROM letters ORDER BY generated_at DESC");
        $rows = $stmt->fetchAll();
        foreach ($rows as $row) {
            $db_records[$row['doc_id']] = $row;
        }
    } catch (PDOException $e) {
        // NEW: Prints the exact SQL error directly into your browser's F12 console for instant debugging
        echo "<script>console.error('PHP MySQL Query Error: " . addslashes($e->getMessage()) . "');</script>";
    }
    ?>
    <script>
        const databaseInjectedRecords = <?php echo json_encode($db_records); ?>;
        const databaseInjectedStaged = []; 
    </script>

    <!-- 2. Frontend controller script (Loads after data variables are registered) -->
    <script src="assets/js/app.js"></script>
</body>

</html>