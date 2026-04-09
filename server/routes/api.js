const express = require('express')
const multer = require('multer')
const path = require('path')
const { generateBacklog } = require('../services/llm')
const { extractTextFromFile } = require('../services/extractText')
const authentication = require('../middlewares/authentication')
const prisma = require("../lib/prisma")
const router = express.Router()
const { client } = require('../connectRedis')
const { rateLimiter } = require("../middlewares/rateLimiter")

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, next) => {
        if (file.mimetype == 'application/pdf' ||
            file.mimetype == 'text/plain' ||
            file.mimetype == 'text/markdown' ||
            file.mimetype == 'application/json' ||
            file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.originalname.endsWith('.md')) {
            next(null, true)
        } else {
            next(null, false)
        }
    }
})

router.post('/generate-backlog', authentication, rateLimiter({ keyGenerator: (req) => "/generate-backlog", maxRequests: 5, window: 60 * 10 }), upload.array('files'), async (req, res) => {
    try {
        let combinedText = ''
        if (req.files && req.files.length > 0) {
            const filePromises = req.files.map((file) => {
                return extractTextFromFile(file)
            })
            const results = await Promise.all(filePromises)
            combinedText = results.join('\n\n --- FILE BREAK --- \n\n')
        }
        if (req.body.text) {
            combinedText += '\n\n --- TEXT BREAK --- \n\n' + req.body.text
        }
        if (!combinedText) {
            return res.status(400).json({ message: 'No text or files provided' })
        }
        const backlog = await generateBacklog(combinedText)
        const project = await prisma.project.create({
            data: {
                title: backlog.project_name,
                backlog: backlog,
                prompt: combinedText,
                user: {
                    connect: {
                        id: req.userId
                    }
                }
            }
        })
        client.del(`projects:user:${req.id}`)
        return res.status(200).json(backlog)
    } catch (error) {
        console.error('Error generating backlog:', error)
        return res.status(500).json({ message: 'Error generating backlog' })
    }
})

router.post('/export-csv', authentication, rateLimiter({ keyGenerator: (req) => "/export-csv", maxRequests: 10, window: 60 * 10 }), (req, res) => {
    try {
        const { backlog } = req.body
        if (!backlog) {
            return res.status(400).json({ message: 'No backlog provided' })
        }
        const headers = ['Epic Title', 'Epic Description', 'Story Title', 'User Story', 'Acceptance Criteria', 'Priority', 'Story Points']
        const rows = backlog.epics.map((epic) => {
            return epic.stories.map((story) => {
                return [
                    epic.title,
                    epic.description,
                    story.title,
                    story.user_story,
                    story.acceptance_criteria.join('\n'),
                    story.priority,
                    story.story_points
                ].join(',')
            })
        })
        const csvContent = [headers.join(','), ...rows].join('\n')
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="${backlog.projectName || 'backlog'}.csv"`)
        res.send(csvContent)
    } catch (error) {
        console.error('Error exporting CSV:', error)
        return res.status(500).json({ message: 'Error exporting CSV' })
    }
})


module.exports = router
