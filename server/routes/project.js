const express = require('express')
const projectRouter = express.Router()
const authentication = require('../middlewares/authentication')
const prisma = require('../lib/prisma')
const { client } = require('../connectRedis')
const { rateLimiter } = require("../middlewares/rateLimiter")

const TTL = 60
projectRouter.get('/projects', authentication, rateLimiter({ keyGenerator: (req) => "/projects", maxRequests: 10, window: 60 * 10 }), async (req, res) => {
    try {
        const key = `projects:user:${req.userId}`
        const cached = await client.get(key)
        if (cached) {
            console.log('Cache Hit')
            return res.status(200).json(JSON.parse(cached))
        }
        console.log('Cache Miss')
        let projects = await prisma.project.findMany({
            where: {
                user: {
                    id: req.userId
                }
            }
        })
        projects = projects.map((project) => {
            return {
                title: project.title,
                createdAt: project.createdAt,
                id: project.id
            }
        })
        await client.setEx(key, TTL, JSON.stringify(projects))
        return res.status(200).json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return res.status(500).json({ message: 'Error fetching projects' })
    }
})


projectRouter.get('/:id', authentication, rateLimiter({ keyGenerator: (req) => `/project:${req.params.id}`, maxRequests: 10, window: 60 * 10 }), async (req, res) => {
    try {
        const id = req.params.id
        const key = `project:${id}:user:${req.userId}`
        const cached = await client.get(key)
        if (cached) {
            console.log("Cache Hit")
            return res.status(200).json({ project: JSON.parse(cached) })
        }
        console.log("Cache Miss")
        const project = await prisma.project.findUnique({
            where: {
                id: id,
                user: {
                    id: req.userId
                }
            }
        })
        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }
        client.setEx(key, TTL, JSON.stringify(project))
        return res.status(200).json({ project: project })
    } catch (error) {
        console.error('Error fetching project:', error)
        return res.status(500).json({ message: 'Error fetching project' })
    }
})

module.exports = projectRouter