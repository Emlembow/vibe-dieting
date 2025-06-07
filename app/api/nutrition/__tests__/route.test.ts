import { POST } from '../route'
import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth-api'
import OpenAI from 'openai'

// Mock the global Request and Response
global.Request = class Request {} as any
global.Response = class Response {} as any

jest.mock('@/lib/auth-api')
jest.mock('openai')
jest.mock('fs')
jest.mock('path')

const mockAuthenticateRequest = authenticateRequest as jest.Mock
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>

describe('/api/nutrition', () => {
  let mockRequest: Partial<NextRequest>
  let mockOpenAIInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockRequest = {
      json: jest.fn(),
    }

    mockOpenAIInstance = {
      responses: {
        create: jest.fn(),
      },
    }

    mockOpenAI.mockImplementation(() => mockOpenAIInstance)

    // Mock file system
    const fs = require('fs')
    const path = require('path')
    
    fs.readFileSync = jest.fn()
      .mockReturnValueOnce('Mock system prompt')
      .mockReturnValueOnce('{"type": "object", "properties": {}}')
    
    path.join = jest.fn().mockReturnValue('/mock/path')

    // Set environment variable
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('returns error when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Missing required environment variable: OPENAI_API_KEY')
  })

  it('returns error when authentication fails', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: null,
      error: 'Invalid token',
    })

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Invalid token')
  })

  it('returns error when user is not authenticated', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: null,
      error: null,
    })

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Authentication required')
  })

  it('returns error when request body is invalid', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockRejectedValue(new Error('Invalid JSON'))

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Food name is required')
  })

  it('returns error when foodName is missing', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockResolvedValue({})

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Food name is required')
  })

  it('successfully analyzes food nutrition', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockResolvedValue({
      foodName: 'apple',
    })

    const mockNutritionData = {
      foods: [
        {
          name: 'Apple',
          calories: 95,
          protein_grams: 0.5,
          carbs_total_grams: 25,
          fat_total_grams: 0.3,
          description: 'A fresh apple',
        },
      ],
    }

    mockOpenAIInstance.responses.create.mockResolvedValue({
      output: [
        {
          type: 'function_call',
          arguments: JSON.stringify(mockNutritionData),
        },
      ],
    })

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockNutritionData)
    expect(mockOpenAIInstance.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4.1-nano',
        input: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.arrayContaining([
              expect.objectContaining({
                type: 'input_text',
                text: 'Mock system prompt',
              }),
            ]),
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({
                type: 'input_text',
                text: 'apple',
              }),
            ]),
          }),
        ]),
      })
    )
  })

  it('handles OpenAI API errors', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockResolvedValue({
      foodName: 'apple',
    })

    mockOpenAIInstance.responses.create.mockRejectedValue(
      new Error('OpenAI API error')
    )

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('OpenAI API error')
  })

  it('handles missing parsed response from OpenAI', async () => {
    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockResolvedValue({
      foodName: 'apple',
    })

    mockOpenAIInstance.responses.create.mockResolvedValue({
      output: [
        {
          type: 'text',
          content: 'No function call',
        },
      ],
    })

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('No function call found in response')
  })

  it('handles file system errors when reading prompts', async () => {
    const fs = require('fs')
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File not found')
    })

    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockResolvedValue({
      foodName: 'apple',
    })

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Failed to analyze nutrition information')
  })

  it('handles JSON parsing errors for schema', async () => {
    const fs = require('fs')
    fs.readFileSync = jest.fn()
      .mockReturnValueOnce('Mock system prompt')
      .mockReturnValueOnce('invalid json')

    mockAuthenticateRequest.mockResolvedValue({
      user: { id: 'test-user' },
      error: null,
    })

    ;(mockRequest.json as jest.Mock).mockResolvedValue({
      foodName: 'apple',
    })

    const response = await POST(mockRequest as NextRequest)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Failed to analyze nutrition information')
  })
})