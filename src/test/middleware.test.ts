import { describe, expect, test, it, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

describe('middleware', () => {
  let server

  beforeAll(async () => {
    await app.prepare()
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    });

    await new Promise<void>((resolve, reject) => {
      server.listen(3000, (err) => {
        if (err) {
          console.error('Server listen error:', err)
          return reject(err)
        }
        resolve()
      })
    })
  })

  afterAll(async () => {
    await app.close();
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error('Server close error:', err)
          return reject(err)
        }
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
      console.error('Test error:', error)
      throw error
    }
  })
})

