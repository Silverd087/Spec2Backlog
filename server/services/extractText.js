const fs = require('fs')
const pdf = require('pdf-parse')
const mammoth = require("mammoth")
const extractTextFromFile = async (file) => {
    let data = ""
    try {
        if (file.mimetype == "application/pdf") {
            const dataBuffer = fs.readFileSync(file.path)
            const pdfData = await pdf(dataBuffer)
            data = pdfData.text
        } else if (file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const docData = await mammoth.extractRawText({ path: file.path })
            data = docData.value
        } else if (file.mimetype == "text/plain" || file.mimetype == "text/markdown") {
            data = fs.readFileSync(file.path, 'utf8')
        }
    } catch (error) {
        console.error("Error extracting text:", error)
        throw error
    } finally {
        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
        }
    }
    return data
}

module.exports = { extractTextFromFile }
