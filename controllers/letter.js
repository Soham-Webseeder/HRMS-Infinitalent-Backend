const bussinessUnit = require("../models/company/bussinessUnit");
const Employee = require("../models/employee/employee");
const Letter = require("../models/letters/letter"); // Adjust the path as needed
const Signatory = require("../models/letters/signatory")
const postOffice = require("../models/letters/postOffice");
const Category = require("../models/letters/category");
const Template = require("../models/letters/template");
const Company = require("../models/company/company");
const { PDFDocument } = require("pdf-lib");
const { letterAndEmailContentHandlers } = require("../utils/stringHandlers");
const { transporter } = require("../utils/transporter");
const fs = require("fs").promises;
const puppeteer = require('puppeteer');
const path = require("path");
const logoPath = path.join(__dirname, "../images/Logo.jpeg");
const logoData = fs.readFile(logoPath).catch(err => { console.error("Logo read error:", err); return Buffer.from(""); });
const logoBase64 = logoData.then(data => `data:image/jpeg;base64,${data.toString("base64")}`).catch(() => "");
const { uploadBufferToCloudinary } = require("../utils/uploadBufferToCloudinary");
const LETTERHEAD_TEMPLATE_PATH = path.join(__dirname, 'ICPL Letter Head.pdf');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createSignatorySection = (signatories, signatoryImages) => {
  let signatoryHTML = '<div class="signatory-section">';

  signatories.forEach((signatory) => {
    const signatureImage = signatoryImages[signatory];
    signatoryHTML += `
        <div class="signatory-container">
          ${signatureImage
        ? `
            <div class="signature-image">
              <img src="${signatureImage}" alt="${signatory}'s signature" style="max-height: 100px; width: auto;"/>
            </div>
          `
        : ""
      }
          <div class="signatory-details">
            <strong>${signatory}</strong>
          </div>
        </div>
      `;
  });

  signatoryHTML += "</div>";
  return signatoryHTML;
};

// Phase A Step 1: Generates HTML for Content ONLY (No letterhead elements)
// The letter-content padding is essential to reserve space on the page.
const generateContentHTML = async (emp, companyDetails, letterContent, signatories, signatoryImages) => {
    const processedContent = await letterAndEmailContentHandlers(letterContent, emp, companyDetails);
    const signatorySection = createSignatorySection(signatories, signatoryImages);

    return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              /* This @page rule is the ONLY margin rule applied by the PDF generator. 
              We use it to define the exact printable area of the content layer, 
              forcing it to align perfectly between the letterhead's header and footer.
              
              Header Height is ~180px (top margin)
              Footer Height is ~130px (bottom margin)
              180px / 96dpi * 25.4 mm/inch ≈ 47.6 mm
              130px / 96dpi * 25.4 mm/inch ≈ 34.4 mm
              We use 50mm and 35mm for generous, clean margins.
              */
              @page {
                margin-top: 50mm;      /* Leaves room for the Header (180px) */
                margin-bottom: 35mm;   /* Leaves room for the Footer (130px) */
                margin-left: 20mm;     /* General side margin */
                margin-right: 20mm;    /* General side margin */
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                font-size: 12pt;
              }
              .content-text {
                  /* Natural content flow */
                  page-break-after: auto;
                  page-break-before: auto;
                  page-break-inside: auto;
              }
              .signatory-section {
                margin-top: 50px;
                /* CRITICAL: Must not break inside this element */
                page-break-inside: avoid !important; 
                page-break-before: auto;
              }
              .signatory-container {
                display: inline-block;
                margin-right: 40px;
                text-align: left;
                vertical-align: top;
              }
              .signature-image img {
                  width: auto;
                  max-height: 80px;
              }
              .letter-content * {
                  color: black !important;
              }
            </style>
          </head>
          <body>
            <div class="content-text">
              ${processedContent}
              ${signatorySection}
            </div>
          </body>
        </html>
    `;
};

// Phase A Step 2: Creates the content-only PDF buffer using Puppeteer
const createTemporaryContentPDF = async (htmlContent, browserInstance) => {
    let page = null;
    try {
        page = await browserInstance.newPage();
        
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
        await page.setContent(htmlContent, { 
            waitUntil: ['networkidle0', 'domcontentloaded'], 
            timeout: 30000 
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            // CRITICAL: We rely solely on the CSS @page margins (50mm/35mm)
            preferCSSPageSize: true,
            // REMOVE the margin: { top: '0mm', ...} setting to avoid conflict
        });

        return pdfBuffer;
    } finally {
        if (page) await page.close();
    }
};

// Phase B: Imposes the content PDF onto the letterhead template
const imposeContentOntoTemplate = async (contentPdfBuffer) => {

  // 1. Load the Letterhead Template PDF
  let templatePdfBytes;
  try {
    templatePdfBytes = await fs.readFile(LETTERHEAD_TEMPLATE_PATH);
  } catch (error) {
    console.error("Error reading Letterhead PDF:", error);
    throw new Error("Letterhead template file not found or unreadable.");
  }

  const templatePdfDoc = await PDFDocument.load(templatePdfBytes);
  const [templatePage] = await templatePdfDoc.copyPages(templatePdfDoc, [0]); // Use first page as template

  // 2. Load the Content PDF (Dynamic text)
  const contentPdfDoc = await PDFDocument.load(contentPdfBuffer);
  const contentPages = contentPdfDoc.getPages();
  const contentPageCount = contentPages.length;

  // 3. Create the Final Document and Merge
  const finalPdfDoc = await PDFDocument.create();

  for (let i = 0; i < contentPageCount; i++) {
    // Create a new page in the final document
    const finalPage = finalPdfDoc.addPage([templatePage.getWidth(), templatePage.getHeight()]);

    // Draw the Letterhead (Background)
    const embeddedTemplate = await finalPdfDoc.embedPage(templatePage);
    finalPage.drawPage(embeddedTemplate);

    // Draw the Content Page (Foreground)
    const embeddedContent = await finalPdfDoc.embedPage(contentPages[i]);
    finalPage.drawPage(embeddedContent);
  }

  return finalPdfDoc.save(); // Return the byte buffer of the final merged PDF
};

exports.getSignatories = async (req, res) => {
  try {
    const signatories = await Signatory.find();
    res.status(200).json({ success: true, data: signatories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch signatories", error: error.message });
  }
};

exports.addOrUpdateSignatory = async (req, res) => {
  const { name, image } = req.body;

  try {
    const updatedSignatory = await Signatory.findOneAndUpdate(
      { name },
      { image },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: updatedSignatory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save signatory", error: error.message });
  }
};

exports.deleteSignatory = async (req, res) => {
  const { id } = req.params;
  try {
    await Signatory.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Signatory deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete signatory", error: error.message });
  }
};

exports.getAllLetters = async (req, res) => {
  try {
    const letters = await Letter.find()
      .populate("audience.includedEmployees")
      .populate("letterContent.template");

    if (!letters) {
      res.status(404).json({
        success: false,
        message: "Letters does not exists",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: { letters },
      message: "Letters fetched successfully",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Error in Fetching Letters",
      error: error.message,
    });
  }
};

exports.getSentLetter = async (req, res) => {
  const { id } = req.params;

  try {
    const letter = await Letter.findById(id);

    if (!letter) {
      return res
        .status(404)
        .json({ success: false, message: "Letter not found" });
    }

    // Optionally, populate any related data if needed, like recipients
    // letter = await Letter.findById(id).populate('audience.includedEmployees');

    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    console.error("Error fetching letter by ID:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create a new category
    const newCategory = new Category({
      name,
      description: description || "",
    });

    await newCategory.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category: name });
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find({}, "name"); // Fetch only the 'name' field
    const categoryNames = categories.map((category) => category.name); // Extract category names

    res.status(200).json(categoryNames);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

exports.getTemplatesByCategory = async (req, res) => {
  try {
    const templates = await Template.find({
      category: req.params.category,
      isEnabled: true, // Fetch only enabled templates
    }).select("templateName category letterContent emailSubject emailContent");

    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

exports.getTemplateById = async (req, res) => {
  const { templateId } = req.params;

  try {
    // Query the database to find the template by its ID
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Return the template data
    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the template by ID
    const deletedTemplate = await Template.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting template",
      error: error.message,
    });
  }
};

exports.updateTemplateStatus = async (req, res) => {
  const { id } = req.params;
  const { isEnabled } = req.body;

  try {
    // Update the isEnabled status of the template in the database
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { isEnabled },
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template status:", error);
    res.status(500).json({ message: "Error updating template status" });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find({}).select(
      "templateName category letterContent emailSubject emailContent"
    );
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

exports.saveAsTemplate = async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const {
      templateName,
      category,
      letterContent,
      emailSubject,
      emailContent,
    } = req.body;

    // Check if the template already exists
    const existingTemplate = await Template.findOne({ templateName });
    if (existingTemplate) {
      return res.status(400).json({ message: "Template already exists" });
    }

    // Create a new template
    const newTemplate = new Template({
      templateName,
      category,
      letterContent, // Use `letterContent` for clarity
      emailSubject, // Add emailSubject
      emailContent, // Add emailContent
    });

    await newTemplate.save(); // Save the new template to the database
    res.status(201).json(newTemplate); // Respond with the created template
  } catch (error) {
    console.error("Error saving template:", error);
    res
      .status(400)
      .json({ message: "Error saving template", error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const {
    templateName,
    category,
    letterContent,
    emailSubject,
    emailContent,
  } = req.body;

  try {
    const updatedTemplate = await Template.findByIdAndUpdate (
      id,
      {
        $set: {
          templateName: templateName,
          category: category,
          letterContent: letterContent,
          emailSubject: emailSubject,
          emailContent: emailContent,
        },
      },
      { new: true}
    );

    if (!updatedTemplate) {
      return res.status(404).json({
        success: false,
        message: "Template not found for update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template updated successfully!",
    })
  } catch (error) {
    console.error("Error updating template :",error);
    res.status(500).json({
      success: false,
      message: "Error updating tempate",
      error: error.message,
    });
  }
}

exports.saveDraft = async (req, res) => {
  const {
    letterName,
    letterContent,
    signatories,
    signatoryImages, // Added signatoryImages
    audience,
    status,
    emailDetails,
  } = req.body;

  try {
    // Create a new draft with the provided data
    const newDraft = new Letter({
      letterName,
      letterContent: {
        content: letterContent.content,
        category: letterContent.category,
        saveAsTemplate: letterContent.saveAsTemplate,
      },
      signatories,
      signatoryImages, // Add signatoryImages field
      audience: {
        group: audience.group,
        options: audience.options,
      },
      status,
      emailDetails: {
        subject: emailDetails.subject,
        body: emailDetails.body,
      },
      createdAt: new Date(), // Explicitly set createdAt
    });

    await newDraft.save();
    res
      .status(201)
      .json({ message: "Draft saved successfully", draft: newDraft });
  } catch (error) {
    console.error("Error saving draft:", error);
    res
      .status(500)
      .json({ message: "Error saving draft", error: error.message });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    // Include signatoryImages in the query
    const drafts = await Letter.find({ status: { $in: ["draft", "edited"] } })
      .select('letterName letterContent signatories signatoryImages audience status emailDetails createdAt updatedAt');

    res.status(200).json({ success: true, data: drafts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching drafts",
      error: error.message,
    });
  }
};


exports.getDraftById = async (req, res) => {
  try {
    // Include signatoryImages in the query
    const draft = await Letter.findById(req.params.id)
      .select('letterName letterContent signatories signatoryImages audience status emailDetails createdAt updatedAt');

    if (!draft) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }
    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching draft",
      error: error.message,
    });
  }
};

exports.deleteDraftById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the draft by ID
    const deletedDraft = await Letter.findByIdAndDelete(id);

    if (!deletedDraft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting draft",
      error: error.message,
    });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const updatedDraft = await Letter.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          letterName: req.body.letterName,
          "letterContent.category": req.body.letterContent.category,
          "letterContent.template": req.body.letterContent.template,
          "letterContent.content": req.body.letterContent.content,
          "letterContent.saveAsTemplate": req.body.letterContent.saveAsTemplate,
          "emailDetails.subject": req.body.emailContent.subject,
          "emailDetails.body": req.body.emailContent.body,
          audience: req.body.audience,
          signatories: req.body.signatories,
          signatoryImages: req.body.signatoryImages, // Add signatoryImages
          status: "edited",
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: false }
      }
    );

    if (!updatedDraft) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found" });
    }
    res.status(200).json({
      success: true,
      data: updatedDraft,
      message: "Draft updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating draft",
      error: error.message,
    });
  }
};

exports.sendMail = async (req, res) => {
  const {
    letterName,
    emailContent,
    emailSubject,
    letterContent,
    audienceGroup,
    audienceOptions,
    signatories,
    signatoryImages,
    category,
    includedEmployees,
    excludeEmployees,
  } = req.body;

  let browser = null;
  const sentLetters = [];
  const failedEmails = [];

  try {
    if (!letterName || !emailContent || !emailSubject || !letterContent || !includedEmployees) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let employees = [];
    let companyDetails = await Company.findOne();

    // REMOVED: SVG and logoBase64 reading logic is simpler now, but keeping for reference if needed elsewhere.

    // Fetch employee details
    for (const empId of includedEmployees) {
      const e = await Employee.findById(empId);
      if (e) {
        employees.push(e);
      }
    }

    if (employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    // REMOVED: splitContentIntoPages logic is deleted.

    console.log("Launching global Puppeteer instance...");

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ]
    });

    for (const emp of employees) {
      const employeeFullName = `${emp.firstName}_${emp.lastName}`;
      const MAX_RETRIES = 3;
      let attempt = 0;
      let emailSentSuccessfully = false;
      let pdfUrl;
      let finalPdfBuffer; // Renamed from pdfBuffer to finalPdfBuffer

      try {
        console.log(`Processing employee: ${emp.firstName} ${emp.lastName}`);

        // 1. PHASE A: Generate personalized HTML (Content only) and temporary PDF buffer
        const contentHTML = await generateContentHTML(emp, companyDetails, letterContent, signatories, signatoryImages);
        const contentPdfBuffer = await createTemporaryContentPDF(contentHTML, browser);

        // 2. PHASE B: Impose Content onto the Letterhead Template
        finalPdfBuffer = await imposeContentOntoTemplate(contentPdfBuffer);

        // Upload the final, merged PDF to Cloudinary
        const uniqueName = `${letterName}_${employeeFullName}_${Date.now()}`;
        const cloudinaryResult = await uploadBufferToCloudinary(finalPdfBuffer, uniqueName);
        pdfUrl = cloudinaryResult.secure_url;


        // 3. Prepare personalized email content
        const emailHtmlContent = await letterAndEmailContentHandlers(emailContent, emp, companyDetails);

        const mailOptions = {
          from: '"HR-InfiniTalent" <' + process.env.EMAIL_FROM + ">",
          to: emp.email,
          subject: emailSubject,
          html: emailHtmlContent,
          attachments: [{
            filename: `${emp.firstName}_letter.pdf`,
            content: finalPdfBuffer, // Use the final merged buffer
            contentType: "application/pdf",
          }],
        };

        // 4. Send email with Retry Mechanism
        while (attempt < MAX_RETRIES) {
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${emp.email}`);
            emailSentSuccessfully = true;
            break; // Exit retry loop on success
          } catch (mailError) {
            if (mailError.responseCode === 450 || mailError.code === 'EENVELOPE') {
              attempt++;
              if (attempt < MAX_RETRIES) {
                const retryDelay = 5000 * attempt;
                console.warn(`Recipient rate-limited for ${emp.email}. Retrying in ${retryDelay / 1000}s... (Attempt ${attempt})`);
                await delay(retryDelay);
              } else {
                throw new Error(`Failed to send email to ${emp.email} after ${MAX_RETRIES} attempts. Final error: ${mailError.message}`);
              }
            } else {
              throw mailError;
            }
          }
        }

        // 5. Implement Throttling
        await delay(10000);

        // 6. Create Letter document
        const letterDoc = await Letter.create({
          pdfUrl,
          letterName,
          audience: {
            group: audienceGroup,
            options: audienceOptions,
            includedEmployees: [emp._id],
            excludeEmployees,
          },
          letterContent: { content: letterContent, category },
          emailDetails: { subject: emailSubject, body: emailContent },
          signatories,
          signatoryImages,
          status: emailSentSuccessfully ? "sent" : "pdf_created_but_email_failed",
        });
        sentLetters.push(letterDoc);

      } catch (empError) {
        console.error(`Error processing employee ${emp.firstName} (${emp.email}):`, empError.message);
        failedEmails.push({ employee: emp.email, error: empError.message });
        // Continue with next employee
      }
    }

    // Respond with results
    return res.status(200).json({
      success: true,
      data: sentLetters,
      message: `Emails processed for ${employees.length} employees. Sent: ${sentLetters.length}. Failed: ${failedEmails.length}.`,
      failedEmails,
    });
  } catch (error) {
    console.error("Error sending email batch:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending email batch",
      error: error.message,
    });
  } finally {
    // 7. Close browser instance
    if (browser) {
      await browser.close();
      console.log("Global Puppeteer instance closed.");
    }
  }
};

// Get all letters sent to a specific employee (by employee ID)
exports.getLetterById = async (req, res) => {
  try {
    const empId = req.params.empId; // Employee ID from URL

    // Find all letters where this employee is included
    const letters = await Letter.find({
      "audience.includedEmployees": empId
    })
      .sort({ createdAt: -1 }) // Most recent first
      .select('letterName letterContent pdfUrl createdAt status'); // Only return necessary fields

    res.json(letters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const {
      identifier,
      letterName,
      letterCategory,
      letterTemplate,
      audienceGroup,
      audienceOptions,
      includedEmployees,
      excludeEmployees,
      type,
      signatories,
    } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Identifier is required." });
    }

    // Create a new letter using the Letter schema
    const newPost = await postOffice.create({
      identifier: identifier,
      letterName: letterName || identifier,
      letterContent: {
        category: letterCategory,
        template: letterTemplate,
      }, // Assuming identifier might be used as letterName if letterName is missing
      audience: {
        options: audienceOptions,
        group: audienceGroup,
        includedEmployees,
        excludeEmployees,
      },
      type,
      signatories, // Assuming this is an array of signatories
      status: req.body.status || "publish", // Default to 'draft'
    });

    // Return the saved letter as the response
    res.status(201).json({
      success: true,
      data: {
        post: newPost,
      },
      message: "Post is created successfully",
    });
  } catch (error) {
    console.error("Error saving letter:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    const posts = await postOffice
      .find()
      .populate(
        "audience.includedEmployees audience.excludeEmployees",
        "firstName lastName photograph"
      );
    if (!posts) {
      return res.status(404).json({
        success: false,
        message: "Post Does Not Exists",
      });
    }
    res.status(201).json({
      success: true,
      data: {
        posts,
      },
      message: "Post fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLetter = async (req, res) => {
  try {
    const deleted = await Letter.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Letter not found" });
    }
    return res.status(200).json({ message: "Letter deleted Successfully" });
  } catch (error) {
    console.error("Delete error: ", error);
    res.status(500).json({ message: "Server error" });
  }
}