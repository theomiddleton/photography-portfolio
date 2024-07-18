import { describe, expect, test, it, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
let server

describe('middleware', () => {
    beforeAll(async () => {
        await app.prepare()
        server = createServer((req, res) => {
            const parsedUrl = parse(req.url, true)
            handle(req, res, parsedUrl)
        }).listen(3000)
    }, 30000)

    afterAll(async () => {
        if (app) await app.close()
        if (server) await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err)
                resolve()
            })
        })
    })
    
    it('should redirect to signin if not authenticated', async () => {
        try {
            const response = await request(server).get('/admin')
            expect(response.statusCode).toBe(200)
            expect(response.header.location).toBe('/signin')
        } catch (error) {
            console.error("test error: ", error)
            throw error
        }
    })
})

