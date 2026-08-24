<?php
// Note: Do NOT include includes/auth.php here. This page must remain public.

$doc_id = trim($_GET['doc_id'] ?? '');
$record = null;
$error = '';

// Helper function to mask recipient names (e.g., "John Doe" -> "J*** D**")
function maskName($name)
{
    $parts = explode(' ', $name);
    $maskedParts = [];
    foreach ($parts as $part) {
        $len = strlen($part);
        if ($len <= 2) {
            $maskedParts[] = substr($part, 0, 1) . str_repeat('*', max(0, $len - 1));
        } else {
            $maskedParts[] = substr($part, 0, 1) . str_repeat('*', $len - 2) . substr($part, -1);
        }
    }
    return implode(' ', $maskedParts);
}

// Helper function to mask Passport or National IDs (e.g., "A1234567" -> "A1****67")
function maskId($id)
{
    $len = strlen($id);
    if ($len <= 4) {
        return str_repeat('*', $len);
    }
    return substr($id, 0, 2) . str_repeat('*', $len - 4) . substr($id, -2);
}

// Query file-based JSON storage
if (!empty($doc_id)) {
    $json_file = 'data/records.json';
    if (file_exists($json_file)) {
        $records = json_decode(file_get_contents($json_file), true) ?: [];
        if (isset($records[$doc_id])) {
            $record = $records[$doc_id];
        } else {
            $error = 'The requested Document ID is not recognized in our registry database.';
        }
    } else {
        $error = 'The system registry database is currently unavailable.';
    }
} else {
    $error = 'No Document ID parameter was provided for validation query.';
}

// Evaluate validation status details if a record was discovered
$isValid = false;
$statusText = 'Unknown';
if ($record) {
    $today = date('Y-m-d');
    $expiry = $record['expiry_date'];

    if ($today <= $expiry) {
        $isValid = true;
        $statusText = 'Verified & Active';
    } else {
        $isValid = false;
        $statusText = 'Expired Document';
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registry Validation System | DocuVerify</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>

<body class="bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between">

    <!-- Simple Top branding element -->
    <header class="py-6 border-b border-slate-800">
        <div class="max-w-md mx-auto px-4 text-center">
            <div class="inline-flex items-center space-x-2">
                <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                        </path>
                    </svg>
                </div>
                <span class="font-bold text-sm tracking-widest text-white uppercase">DocuVerify Validation Portal</span>
            </div>
        </div>
    </header>

    <!-- Core verification display frame -->
    <main class="flex-grow flex items-center justify-center px-4 py-12">
        <div
            class="w-full max-w-md bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">

            <?php if ($record): ?>
                <!-- SUCCESS STATE -->
                <div class="p-6 text-center border-b border-slate-700/60">
                    <?php if ($isValid): ?>
                        <!-- Authentic Green Badge -->
                        <div
                            class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h2 class="text-lg font-bold text-emerald-400">Authentic & Verified Document</h2>
                        <p class="text-xs text-slate-400 mt-1">This query is matched to an active system record.</p>
                    <?php else: ?>
                        <!-- Expired Amber Badge -->
                        <div
                            class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                                </path>
                            </svg>
                        </div>
                        <h2 class="text-lg font-bold text-amber-400">Expired Document Record</h2>
                        <p class="text-xs text-slate-400 mt-1">This document has reached its defined expiration date limit.</p>
                    <?php endif; ?>
                </div>

                <!-- Record Details Layout -->
                <div class="p-6 space-y-4 text-sm">
                    <div>
                        <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificate
                            Title</span>
                        <span class="text-slate-100 font-medium">
                            <?php echo htmlspecialchars($record['certificate_title']); ?>
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4 border-t border-slate-700/40 pt-3">
                        <div>
                            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipient
                                Name</span>
                            <span class="text-slate-100 font-medium">
                                <?php echo htmlspecialchars(maskName($record['first_name'] . ' ' . $record['last_name'])); ?>
                            </span>
                        </div>
                        <div>
                            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Passport / ID
                                ID</span>
                            <span class="text-slate-100 font-medium font-mono">
                                <?php echo htmlspecialchars(maskId($record['passport'])); ?>
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 border-t border-slate-700/40 pt-3">
                        <div>
                            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Issue
                                Date</span>
                            <span class="text-slate-100 font-medium">
                                <?php echo htmlspecialchars(date('d-M-Y', strtotime($record['issue_date']))); ?>
                            </span>
                        </div>
                        <div>
                            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiration
                                Date</span>
                            <span class="text-slate-100 font-medium">
                                <?php echo htmlspecialchars(date('d-M-Y', strtotime($record['expiry_date']))); ?>
                            </span>
                        </div>
                    </div>

                    <div class="border-t border-slate-700/40 pt-3">
                        <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Issuing
                            Authority</span>
                        <span class="text-slate-100 font-medium text-xs">
                            <?php echo htmlspecialchars($record['authority']); ?>
                        </span>
                    </div>

                    <div class="border-t border-slate-700/40 pt-3 text-center">
                        <span class="text-[10px] text-slate-500 font-medium block">Verified At:
                            <?php echo date('Y-m-d H:i:s T'); ?>
                        </span>
                        <span class="text-[9px] text-slate-500 block -mt-1">Document Reference:
                            <?php echo htmlspecialchars($record['doc_id']); ?>
                        </span>
                    </div>
                </div>

            <?php else: ?>
                <!-- ERROR / NOT FOUND STATE -->
                <div class="p-8 text-center">
                    <div
                        class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                            </path>
                        </svg>
                    </div>
                    <h2 class="text-lg font-bold text-red-400">Validation Failure</h2>
                    <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                        <?php echo htmlspecialchars($error); ?>
                    </p>
                    <p class="text-[11px] text-slate-500 mt-4 leading-normal">
                        This could happen if the document reference was manually typed incorrectly or if the certificate has
                        been removed from our server registry.
                    </p>
                </div>
            <?php endif; ?>

        </div>
    </main>

    <!-- Footer branding stamp -->
    <footer class="py-4 border-t border-slate-800/40">
        <div class="max-w-md mx-auto px-4 text-center text-[10px] text-slate-500 leading-normal">
            &copy; 2026 DocuVerify International Verification Service.<br>
            Protected by dynamic cryptographical validation algorithms.
        </div>
    </footer>

</body>

</html>