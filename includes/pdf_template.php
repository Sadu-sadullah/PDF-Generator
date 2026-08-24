<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Official Document</title>
    <style>
        @page {
            margin: 0px;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            background-color: #ffffff;
            margin: 0px;
            padding: 0px;
            font-size: 13px;
        }

        .header-band {
            background-color: #0f172a;
            color: #ffffff;
            padding: 40px 50px;
        }

        .header-title {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .header-subtitle {
            font-size: 12px;
            color: #94a3b8;
        }

        .content-container {
            padding: 50px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            text-transform: uppercase;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 30px;
            margin-bottom: 15px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .data-table td {
            padding: 10px 0;
            vertical-align: top;
        }

        .label {
            font-weight: bold;
            color: #475569;
            width: 30%;
        }

        .value {
            color: #0f172a;
            width: 70%;
        }

        .footer-table {
            width: 100%;
            border-top: 2px solid #e2e8f0;
            padding-top: 25px;
            margin-top: 60px;
            border-collapse: collapse;
        }

        .verification-info {
            font-size: 11px;
            color: #64748b;
            line-height: 1.5;
        }

        .qr-code-img {
            width: 110px;
            height: 110px;
            border: 1px solid #e2e8f0;
            padding: 4px;
            background-color: #ffffff;
        }
    </style>
</head>

<body>

    <!-- Executive Dark Slate Header -->
    <div class="header-band">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: middle; text-align: left;">
                    <div class="header-title">DOCUVERIFY REGISTRY</div>
                    <div class="header-subtitle">Official Statement of Clearance and Status</div>
                </td>
                <td
                    style="text-align: right; vertical-align: middle; font-size: 11px; color: #cbd5e1; line-height: 1.4; width: 220px;">
                    <strong>Document ID:</strong> <?php echo $data['doc_id']; ?><br>
                    <strong>Generated:</strong> <?php echo date('d-M-Y', strtotime($data['issue_date'])); ?><br>
                    <strong>Expiry Date:</strong> <?php echo date('d-M-Y', strtotime($data['expiry_date'])); ?>
                </td>
            </tr>
        </table>
    </div>

    <!-- Main Certificate Statement -->
    <div class="content-container">

        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="text-align: left;">
                    <h1 style="font-size: 22px; color: #0f172a; margin-bottom: 10px; margin-top: 0px;">
                        <?php echo $data['certificate_title']; ?></h1>
                    <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
                        This document serves as formal confirmation that the recipient specified below has undergone
                        verification checks and aligns with validation structures under registered protocol.
                    </p>
                </td>
            </tr>
        </table>

        <!-- Profile Details Table -->
        <div class="section-title">1. Recipient Details</div>
        <table class="data-table">
            <tr>
                <td class="label">Full Name</td>
                <td class="value"><?php echo $data['first_name'] . ' ' . $data['last_name']; ?></td>
            </tr>
            <tr>
                <td class="label">Nationality</td>
                <td class="value"><?php echo $data['nationality']; ?></td>
            </tr>
            <tr>
                <td class="label">ID/Passport Number</td>
                <td class="value" style="font-family: monospace; font-weight: bold;"><?php echo $data['passport']; ?>
                </td>
            </tr>
            <tr>
                <td class="label">Date of Birth</td>
                <td class="value"><?php echo date('d-M-Y', strtotime($data['dob'])); ?></td>
            </tr>
        </table>

        <!-- Administrative Audit Trail -->
        <div class="section-title">2. Administrative Audit Trail</div>
        <table class="data-table">
            <tr>
                <td class="label">Issuing Authority</td>
                <td class="value"><?php echo $data['authority']; ?></td>
            </tr>
            <tr>
                <td class="label">Date of Issue</td>
                <td class="value"><?php echo date('d F Y', strtotime($data['issue_date'])); ?></td>
            </tr>
            <tr>
                <td class="label">Expiration Status</td>
                <td class="value" style="color: #b91c1c; font-weight: bold;">Valid Until
                    <?php echo date('d F Y', strtotime($data['expiry_date'])); ?></td>
            </tr>
            <tr>
                <td class="label">Compliance Status</td>
                <td class="value" style="color: #15803d; font-weight: bold;">Verified & Approved</td>
            </tr>
        </table>

        <!-- Document Footer Block with Signatures & QR Verification -->
        <table class="footer-table">
            <tr>
                <!-- Left Details: Authority Stamp and sign off -->
                <td style="width: 65%; vertical-align: top; padding-right: 20px; text-align: left;">
                    <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 5px;">Registry
                        Verification Unit</div>
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 30px;">DocuVerify International
                        Secretariat</div>

                    <div class="verification-info">
                        <strong>Security Protection Disclaimer:</strong><br>
                        This is an official document validated through local system archives. To verify authenticity,
                        scan the associated QR code. Direct modification of this document's printed layout compromises
                        valid registration.
                    </div>
                </td>

                <!-- Right Details: Real-time generated Dynamic QR Code -->
                <td style="width: 35%; text-align: right; vertical-align: top;">
                    <img src="<?php echo $qr_code_url; ?>" class="qr-code-img" alt="Verification QR Code">
                    <div
                        style="font-size: 9px; color: #94a3b8; font-weight: bold; margin-top: 4px; padding-right: 15px; text-align: right;">
                        SCAN TO VERIFY</div>
                </td>
            </tr>
        </table>

    </div>

</body>

</html>